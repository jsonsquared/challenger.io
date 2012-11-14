var tileSize = 16;
var moveDistance = 2.5;
var stage, canvas;
var walls = [];
var halfWalls = [];
var spawnPoints = [];
var garbage = [];
var players = {};
var leaderboard = [];
var inputInterval = 20;
var natural_light = .90;
var pushFrequency = 50;
var rateOfFire = 130;
var recoil = 0;
var canvas_main, canvas_lighting, canvas_main_ctx;
var crosshair, crosshairX, crosshairY;
var me;
var lastPush = {x:-1, y:-1, rotation:-1};
var use_sounds = true;
var hijackRightClick = window.location.hash.indexOf('#dev') == -1;
var name = false;
var socket;
var connected = false;
var spriteSheets = {};
var flash
var assets = {
    'map'   :  '/assets/images/map.jpg',
    'bullet':  '/assets/images/bullet.png',
    'crosshair': '/assets/images/crosshair.png',
    'muzzle': '/assets/images/muzzle.png'
};

var canvas,ctx,light1={},desc,rect,objects,darkmask,startAt,lastd

var a
var sounds
$(function() {

    sounds= {
        'singleshot': (function() { $('body').append('<audio src="/assets/sounds/singleshot.mp3" preload="none"></audio>'); return $('audio')[0]; })()
    }
    a = sounds.singleshot.cloneNode();
    a.play();

    $(window).bind('resize', fitScreen)
    canvas_main = document.getElementById("canvas-main");
    canvas_lighting = document.getElementById("canvas-lighting");
    stage = new createjs.Stage(canvas_main);
    stage.autoClear = true;

    canvas_main.width = canvas_lighting.width = map[0].length * tileSize
    canvas_main.height = canvas_lighting.height = map.length * tileSize
    canvas_main_ctx = canvas_main.getContext('2d')

    createjs.Ticker.addListener(window);
    createjs.Ticker.setFPS(24);

    $('#game-container').hide();

    $('#name').bind('keypress', function(e) {
        if(e.keyCode == 13) checkName()
    }).focus();

    $('#join-button').bind('click', function() {
        checkName()
        $('#name').blur();
        $(canvas_main).focus()
    });

    preload(assets, function(files) {
        crosshair = new Crosshair();
        fitScreen();
        initMap()
        initLights();
        initGameBindings();
        initSpriteSheets();

    });

});

function connect(name) {
    initPacketHandler();
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
                console.log(msg)
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
}

function checkName() {
    if($('#name').val() > '') {
        name = $('#name').val().substr(0,10);
        connect();
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

    setInterval(function() {
        if(lastPush.x != me.payload.x || lastPush.y != me.payload.y || lastPush.rotation != me.payload.rotation) {
            socket.emit('move', me.payload)
            lastPush = me.payload;
        }
    },pushFrequency)

    setInterval(function() {
        var move = {};
        if($('input:focus').length==0) {
            if(input.keyboard[87] || input.keyboard[38]) { move.y = me.y - moveDistance }
            if(input.keyboard[65] || input.keyboard[37]) { move.x = me.x - moveDistance }
            if(input.keyboard[83] || input.keyboard[40]) { move.y = me.y + moveDistance }
            if(input.keyboard[68] || input.keyboard[39]) { move.x = me.x + moveDistance }
            if(move.x || move.y) me.move(move)

        }
    },inputInterval)

    setInterval(function() {

        if(input.mouse[0] || (input.keyboard[32] && $('input:focus').length==0)) {
            me.fire({offsetX:crosshair.sprite.x, offsetY: crosshair.sprite.y})
            recoil+=2
        }
    },rateOfFire)

}

window.tick = function() {
    $(document).trigger('tick')
    stage.update();

    if(players && connected) {
        for(var p in players) {
            players[p].updatePosition()
        }
    }
    if(connected) render()

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

var objects = []
function initLights() {
    canvas = document.getElementById("canvas-lighting");
    ctx = canvas.getContext("2d");

    light1 = new illuminated.Lamp({
        position: new illuminated.Vec2(100, 250),
        distance: 150,
        radius: 0,
        samples: 1,
        angle:180
    });

    objects = []
    for(var w = 0; w< walls.length; w++) {
        objects.push(new illuminated.RectangleObject({
            topleft: new illuminated.Vec2(walls[w].x* tileSize, walls[w].y* tileSize),
            bottomright: new illuminated.Vec2(walls[w].x*tileSize+tileSize, walls[w].y*tileSize + tileSize)
        }));
    }

    lighting1 = new illuminated.Lighting({
        light: light1,
        objects: objects
    });

    darkmask = new illuminated.DarkMask({ lights: [light1] });

    lighting1.compute(canvas.width, canvas.height);

    darkmask.compute(canvas.width, canvas.height);

}


function render () {

    lighting1.compute(canvas.width, canvas.height);
    darkmask.compute(canvas.width, canvas.height);

    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "rgba(0,0,0,.9)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);


    // need to draw tiles again

    ctx.globalCompositeOperation = "destination-out";
    lighting1.render(ctx);



    ctx.fillStyle = "rgba(255,255,255,.9)";
    // if(!me) return
    for(var o = 0; o< objects.length; o++) {
        // console.log(objects[o])

        x = objects[o].points[0].x - me.x
        y = objects[o].points[0].y - me.y
        var dist = Math.sqrt((x*x) + (y*y))
        // console.log(dist,o)
        if(dist<tileSize*15) {
           ctx.clearRect(objects[o].points[0].x, objects[o].points[0].y, tileSize, tileSize)

            // this draws white boxes
            ctx.beginPath();
            objects[o].path(ctx);
            ctx.fill();
        }
    }
    ctx.globalCompositeOperation = "source-over";
    darkmask.render(ctx);

    canvas_main_ctx.drawImage(canvas,0,0)
}