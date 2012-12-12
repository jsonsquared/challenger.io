var TILE_SIZE = 16;
var MOVE_DISTANCE = 3;
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
var hijackRightClick = window.location.hash.indexOf('#dev') == -1;
var spriteSheets = {};
var messages = [];

var mouseX = 0;
var mouseY = 0
var mapData = {
    walls:[],
    halfWalls:[]
}

var level = 'level2'
var intervals = {
    push:   {rate:50},
    move:   {rate:20},
    fire:   {rate:130}
}

var settings = {
    sounds:true
}

var assets = {
    'map'   :  '/assets/images/map.jpg',
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


INPUT_U = function() { return input.keyboard[87] || input.keyboard[38] ? true:false }
INPUT_L = function() { return input.keyboard[65] || input.keyboard[37] ? true:false}
INPUT_D = function() { return input.keyboard[83] || input.keyboard[40] ? true:false }
INPUT_R = function() { return input.keyboard[68] || input.keyboard[39] ? true:false }

$(function() {

    $('#game-container').hide();

    $('#name').bind('keypress', function(e) {
        if(e.keyCode == 13) checkName(name, function(name) {connect(name); })
    }).focus();

    $('#join-button').bind('click', function() {
        checkName(checkName(name, function(name) {connect(name); }))
        $('#name').blur();
        $(canvas_main).focus()
    });


    loadMap(level, function(arr) {

        map.data = arr;
        console.log(map.data)
        preload(assets, function(files) {
            fitScreen();
            // initMap()
            // initLights();
            // initSpriteSheets();
            // initSounds();
            // bloodEffect = new BloodEffect();
            // crosshair = new Crosshair();
            $('#name').attr('maxlength', NAME_LENGTH)
        });
    });

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

function range(from,to) {
   return Math.floor(Math.random() * (to - from + 1) + from);
}

function join(instance) {
    startGame(instance)
    initIntervals();
}

function startGame(instance) {
    // if players is not empty, we must be restarting
    if(Object.keys(players).length!==0) {
        for(var p in players) {
            players[p].remove();
        }
        players = {};
        items = [];
        $('#meter-ammo, #meter-hp').remove();
    }

    $("#total_score h2 span").html(instance.score)
    console.log('startGame')
    for(var p in instance.players) {
        players[instance.players[p].id] = new Player(instance.players[p])
    }

    updateLeaderboard()
    // bloodEffect.update(0)
    for(var p in players) {
        if(players[p].id == socket.socket.sessionid) {
            players[p].isMe();
            me = players[p]
        }
        updateLeaderboardHP(p)
    }

    console.log(instance)
    for(var i in instance.items) {

        items[i] = new Item(i, instance.items[i])
    }

    $(document).trigger('startGame')
}

window.tick = function() {
    $(document).trigger('tick')

    if(me) {
        me.stamina = me.stamina < 100 ? me.stamina+1 : 100
        document.title = me.stamina
    }

    // $.each(tileset.tiles,function() {
    //     this.needsUpdate = true;
    // })

    render()


    // garbage collection
    garbage.map(function(el, i, ary) {
        delete garbage.pop();
    })
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