var tileSize = 16;
var moveDistance = 3;
var stage, canvas;
var crosshair_stage;
var walls = [];
var halfWalls = [];
var spawnPoints = [];
var garbage = [];
var players = {};
var leaderboard = [];

var natural_light = 0.2;
var recoil = 0;
var intervals = {
    push:   {rate:50},
    move:   {rate:20},
    fire:   {rate:130}
}
var canvas_main, canvas_lighting, canvas_main_ctx;
var crosshair; // easeljs Bitmap
var me; // alias for which player I am in the players object
var lastPush = {x:-1, y:-1, rotation:-1}; // payload we sent to the server about our position
var use_sounds = true;
var hijackRightClick = window.location.hash.indexOf('#dev') == -1;
var socket;
var connected = false;
var spriteSheets = {};
var assets = {
    'map'   :  '/assets/images/map.jpg',
    'bullet':  '/assets/images/bullet.png',
    'crosshair': '/assets/images/crosshair.png',
    'muzzle': '/assets/images/muzzle.png'
};

INPUT_U = function() { return input.keyboard[87] || input.keyboard[38] ? true:false }
INPUT_L = function() { return input.keyboard[65] || input.keyboard[37] ? true:false}
INPUT_D = function() { return input.keyboard[83] || input.keyboard[40] ? true:false }
INPUT_R = function() { return input.keyboard[68] || input.keyboard[39] ? true:false }

$(function() {

    sounds= {
        'singleshot': (function() { $('body').append('<audio src="/assets/sounds/singleshot.mp3" preload="none"></audio>'); return $('audio')[0]; })()
    }

    $(window).bind('resize', fitScreen)
    canvas_main = document.getElementById("canvas-main");
    canvas_lighting = document.getElementById("canvas-lighting");
    canvas_crosshair = document.getElementById("canvas-crosshair");
    stage = new createjs.Stage(canvas_main);
    stage.autoClear = false;

    crosshair_stage = new createjs.Stage(canvas_crosshair)
    crosshair_stage.autoClear = true;

    canvas_main.width = canvas_lighting.width = canvas_crosshair.width = map[0].length * tileSize
    canvas_main.height = canvas_lighting.height = canvas_crosshair.height = map.length * tileSize
    canvas_main_ctx = canvas_main.getContext('2d')
    canvas_lighting_ctx = canvas_lighting.getContext('2d')

    createjs.Ticker.addListener(window);
    createjs.Ticker.setFPS(30);

    lightingEngine = new LightingEngine(canvas_lighting,canvas_main,natural_light)

    $('#game-container').hide();

    $('#name').bind('keypress', function(e) {
        if(e.keyCode == 13) checkName(name, function(name) {connect(name); })
    }).focus();

    $('#join-button').bind('click', function() {
        checkName(checkName(name, function(name) {connect(name); }))
        $('#name').blur();
        $(canvas_main).focus()
    });

    preload(assets, function(files) {
        fitScreen();
        initMap()
        initLights();
        initGameBindings();
        initSpriteSheets();
        crosshair = new Crosshair();
    });

});

function connect(name) {
    initPacketHandler(name);
}

function fitScreen() {
    $('#game-container').css('-webkit-transform', 'scale(' + ($(window).height() / 900) + ')').css('transform-origin','center top')
}

function initGameBindings() {
    $(canvas_main).bind('mousemove', function(e) {
        crosshair.sprite.x = e.offsetX - 10;
        crosshair.sprite.y = e.offsetY - 10;

        if(connected) me.moved()
    }).bind('click',function(e) {
        if(connected) me.fire(e);
    })

    $('body').bind('mousedown', function(e) {
        e.preventDefault()
    }).bind('mouseup', function(e) {
        e.preventDefault()
        recoil = 0;
    }).bind('mousewheel', function(e) {
        e.preventDefault()
    });

    $(document).unbind("contextmenu").bind("contextmenu",function(e) {
        if(hijackRightClick) {
            socket.emit('manual_reload')
            return false
        }
    })

    $(document).bind('keydown', function(e) {

        // enter
        if(e.keyCode==13) {
            if($('input:focus').length==0) {
                $('#chat-input').focus();
            } else {
                var msg = $('#chat-input').val()
                if(connected) socket.emit('say', msg)
                $('#chat-input').blur().val('')
            }
        }

        // backspace/delete
        if(e.keyCode == 8 && $('input:focus').length==0) {
            return false
        }

        // escape
        if(e.keyCode == 27 && $('input:focus').length==1) {
            $('#chat-input').blur().val('')
        }

        // R
        if(e.keyCode == 82 && $('input:focus').length==0) {
            if(connected) socket.emit('manual_reload')
        }

        if($('input:focus').length==0 && ((e.keyCode >= 37 && e.keyCode <= 40) || e.keyCode==32)) return false
    })


    var lastKeyUp = {was:false, at:new Date()};
    $(document).bind('keyup',function(e) {
        lastKeyUp = {was:e.keyCode,at:new Date()}
    }).bind('keydown',function(e) {
        var now = new Date()
        if(now.getTime() - lastKeyUp.at.getTime() < 200 && e.keyCode == lastKeyUp.was) {
            lastKeyUp = {was:false, at:new Date()};
            if(e.keyCode==87 || e.keyCode==38) me.dash('U')
            if(e.keyCode==68 || e.keyCode==39) me.dash('R')
            if(e.keyCode==83 || e.keyCode==40) me.dash('D')
            if(e.keyCode==65 || e.keyCode==37) me.dash('L')
        }
    })

}


function checkName(name, callback) {
    if($('#name').val() > '') {
        var name = $('#name').val().substr(0,10);
        callback(name)
        $('#enter-container').remove();
        $('#game-container').show();
    } else {
        $('#name').css({border:'2px solid red'});
    }
}

function updateLeaderboard() {
    leaderboard = [];
    for(var i = 0, len = Object.keys(players).length; i < len; i++) {
        leaderboard.push(players[Object.keys(players)[i]]);
    }

    $("#leaderboard table tbody").html('');

    leaderboard = leaderboard.sort(function(a, b) { return b.killCount - a.killCount});

    for(var i = 0, len = leaderboard.length; i < len; i++) {
        var player = leaderboard[i];
        $("#leaderboard table tbody").append('<tr><td>'+parseInt(i + 1, 10)+'.</td><td>'+ player.name +'</td><td>'+ (player.killCount || 0) +'</td><td>'+ (player.deaths || 0 )+'</td></tr><tr><td class="leaderboard-hp" colspan="4"><div id="'+player.id+'" style="width: '+player.health+'%" class="page-header leaderboard-hp"></div></td></tr>')
    }

    document.title = '(' + Object.keys(players).length +') ' + instance
}

function updateLeaderboardHP(player) {
    $('#' + player.id).animate({width: player.health + '%'});
}

function playerHit(bullet) {
    for(var i = 0, len = Object.keys(players).length; i < len; i++) {
        var key = Object.keys(players)[i];
        if(bullet.owner != key && bullet.removed == false) {
            var player = players[key];
            if(player.touching(bullet)) return player;
        }
    }
    return false;
}

function findPlayer(id) {
    for(var i = 0, len = players.length; i < len; i++) {
        if(players[i].id == id) return i;
    }
    return -1;
}
function range(from,to) {
   return Math.floor(Math.random() * (to - from + 1) + from);
}

function join(instance) {

    for(var p in instance.players) {
        players[instance.players[p].id] = new Player(instance.players[p])
    }

    for(var p in players) {
        if(players[p].id == socket.socket.sessionid) {
            players[p].isMe();
            me = players[p]
        }
    }

    initIntervals();

}

window.tick = function() {
    $(document).trigger('tick')

    if(players && connected) {
        for(var p in players) {
            players[p].updatePosition()
        }
    }

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
