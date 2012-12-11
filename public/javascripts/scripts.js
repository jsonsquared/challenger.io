var TILE_SIZE = 16;
var SLIDE_FACTOR = 24;
var STAMINA_TO_DASH = 40;
var NAME_LENGTH = 16;
var CLIP_SIZE = 32;
var socket;
var connected = false;
var stage_under, stage_over;
var garbage = [];
var players = {};
var items = {};
var canvas_main, canvas_lighting, canvas_main_ctx, canvas_lighting_ctx;
var crosshair; // easeljs Bitmap
var me; // alias for which player I am in the players object
var lastPush = {x:-1, y:-1, rotation:-1}; // payload we sent to the server about our position
var hijackRightClick = false//window.location.hash.indexOf('#dev') == -1;
var spriteSheets = {};
var messages = [];
var debug = false;

var FPS = 60
var MOVE_DISTANCE = 2;
var CAMERA_WIDTH = 31;
var CAMERA_CENTER_X = ~~(CAMERA_WIDTH / 2)
var CAMERA_CENTER_Y = ~~(CAMERA_HEIGHT / 2)
var CAMERA_HEIGHT = 31;
var VIEW_DISTANCE = 250;
var TILES_WIDE;
var TILES_HIGH;

var lastViewportRender = {x:-1,y:-1};
var lastBufferRender = {x:-1, y:-1};
var lastLightRender = {x:-1, y:-1}

var solids = [];
var light;
var lighting;
var stage = false;
var map = {}
var bloodEffect = false;

var camera = {x:0,y:0}



var level = 'level2';
var mapData = {
    walls:[],
    halfWalls:[]
}

var intervals = {
    push:   {rate:50},
    move:   {rate:40},
    fire:   {rate:130}
}

var settings = {
    sounds:true
}

var assets = {
    'tileset': '/assets/images/tileset.png',
    'bloodborder'   :  '/assets/images/bloodborder.png',
    'fed'   :  '/assets/images/fed.png',
    'bullet':  '/assets/images/bullet.png',
    'ricochet':  '/assets/images/ricochet.png',
    'crosshair': '/assets/images/crosshair.png',
    'muzzle': '/assets/images/muzzle.png',
    'item': '/assets/images/item.jpg'
};

sounds = {
    'singleshot': '/assets/sounds/singleshot.mp3'
}


function StageManager(options) {
    this.stage = options.stage;
    this.elements = []

    this.add = function(what, index) {
        this.elements.push(what)
        if(arguments.length==2) {
            this.stage.addChildAt(what.container, index)
        } else {
            this.stage.addChild(what.container)
        }
    }

    this.remove = function(what) {
        this.stage.removeChild(what.container)
        $.each(this.elements, function() {
            if(this==what) delete this;
        })
    }
}

var INPUT_U = function() { return input.keyboard[87] || input.keyboard[38] ? true:false };
var INPUT_L = function() { return input.keyboard[65] || input.keyboard[37] ? true:false };
var INPUT_D = function() { return input.keyboard[83] || input.keyboard[40] ? true:false };
var INPUT_R = function() { return input.keyboard[68] || input.keyboard[39] ? true:false };

var tileset;

$(function() {

    // terrain
    base_canvas = debug ? document.getElementById("buffer") : document.createElement("canvas");
    base_canvas.width = (CAMERA_WIDTH+1) * TILE_SIZE
    base_canvas.height = (CAMERA_HEIGHT+1) * TILE_SIZE
    base_ctx = base_canvas.getContext('2d')

    // lighting
    lighting_canvas = debug ? document.getElementById("lighting") : document.createElement("canvas");
    lighting_canvas.width = (CAMERA_WIDTH+1) * TILE_SIZE
    lighting_canvas.height = (CAMERA_HEIGHT+1) * TILE_SIZE
    lighting_ctx = lighting_canvas.getContext('2d')

    // viewport
    viewport_canvas = document.getElementById("viewport");
    viewport_canvas.width = CAMERA_WIDTH * TILE_SIZE
    viewport_canvas.height = CAMERA_HEIGHT * TILE_SIZE
    viewport_ctx = viewport_canvas.getContext('2d')

    // easeljs stage
    stage_canvas = debug ? document.getElementById("buffer") : document.createElement("canvas");
    stage_canvas.width = (CAMERA_WIDTH+1) * TILE_SIZE
    stage_canvas.height = (CAMERA_HEIGHT+1) * TILE_SIZE
    stage_ctx = stage_canvas.getContext('2d')

    stage_stage = new createjs.Stage(stage_canvas);
    stage_stage.autoClear = true;
    stage = new StageManager({stage:stage_stage})

    createjs.Ticker.setFPS(FPS);

    light = new illuminated.Lamp({ position: new illuminated.Vec2(0, 0),samples:1, distance: VIEW_DISTANCE});
    lighting = new illuminated.Lighting({ light: light, objects: []});

    loadMap(level, function(arr) {

        map.data = arr;
        preload(assets,function() {
            createjs.Ticker.addListener(window);
        });
    })

    fitScreen();

    // jquery bindings
    $(window).bind('resize', fitScreen)

    $('#game-container').hide();

    $('#name').bind('keypress', function(e) {
        if(e.keyCode == 13) checkName(name, function(name) {connect(name); })
    }).focus();

    $('#join-button').bind('click', function() {
        checkName(checkName(name, function(name) {connect(name); }))
        $('#name').blur();
        $(canvas_main).focus()
    });

    // bootstrap
    // preload(assets, function(files) {
    //     fitScreen();
    //     initMap()
    //     initLights();
    //     initSpriteSheets();
    //     initSounds();
    //     bloodEffect = new BloodEffect();
    //     crosshair = new Crosshair();
    //     $('#name').attr('maxlength', NAME_LENGTH)
    // });

});

function connect(name) {
    initPacketHandler(name);
    initGameBindings();
}

function fitScreen() {
    $('#game-container').css('-webkit-transform', 'scale(' + ($(window).height() / 900) + ')').css('transform-origin','center top')
}

function checkName(name, callback) {
    if($('#name').val() > '') {
        var name = $('#name').val().substr(0,NAME_LENGTH);
        callback(name)
        $('#enter-container').remove();
        $('#game-container').show();
    } else {
        $('#name').addClass('error')
    }
}

function join(instance) {
    startGame(instance)
    initIntervals();
}


window.tick = function() {

    $(document).trigger('tick')

    if(!me) return

    var move = {};
    if($('input:focus').length==0) {
        if(INPUT_U()) { move.y = me.y - me.moveDistance }
        if(INPUT_L()) { move.x = me.x - me.moveDistance }
        if(INPUT_D()) { move.y = me.y + me.moveDistance }
        if(INPUT_R()) { move.x = me.x + me.moveDistance }
        if(move.x || move.y) me.move(move)
    }
    // handleInput();
    var walls = renderBuffer(me.x, me.y);
    if(walls) solids = processSolids(walls) || solids;
    processLights(solids, me.x%TILE_SIZE, me.y%TILE_SIZE)
    renderViewport(me.x, me.y)
}

function initSpriteSheets() {
    spriteSheets['muzzle'] = new createjs.SpriteSheet({
        images: [assets.muzzle.img],
        frames: {width:19, height:16, regX:9.5, regY:0},
        animations: {
            fire:{frames:[0], frequency:5}
        }
    });
}

function initSounds() {
    for(var s in sounds) {
        var path = sounds[s];
        sounds[s] = {
            path:path,
            clones:[],
            channel:0,
            play:function(volume) {
                this.channel = this.channel >= this.clones.length-1 ? 0 : this.channel+1
                this.clones[this.channel].volume = volume || 1;
                this.clones[this.channel].play()
            }
        };
        for(var c=0;c<5;c++) {
            sounds[s].clones.push(new Audio(path))
        }
    }
}