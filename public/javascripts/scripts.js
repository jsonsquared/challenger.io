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
var natural_light = .3;
var pushFrequency = 50;
var rateOfFire = 130;
var recoil = 0;
var canvas_main, canvas_lighting, canvas_main_Ctx, canvas_lighting_Ctx;
var crosshair, crosshairX, crosshairY;
var me;
var lastPush = {x:-1, y:-1, rotation:-1};
var USE_SOUNDS = false;
var hijackRightClick = window.location.hash.indexOf('#dev') == -1;
var name = false;
var socket;
var connected = false;
var use_lighting = true;
var lighting_precision = 1
var lighting_ray_width = 1

var assets = {
    'map'   :  '/assets/images/map.jpg',
    'bullet':  '/assets/images/bullet.png',
    'crosshair': '/assets/images/crosshair.png'
};

$(function() {

    $(window).bind('resize', fitScreen)
    canvas_main = document.getElementById("canvas-main");
    canvas_lighting = document.getElementById("canvas-lighting");
    stage = new createjs.Stage(canvas_main);
    stage.autoClear = true;

    canvas_main.width = map[0].length * tileSize
    canvas_main.height = map.length * tileSize
    canvas_lighting.width = map[0].length
    canvas_lighting.height = map.length
    canvas_main_ctx = canvas_main.getContext('2d')
    canvas_lighting_ctx = canvas_lighting.getContext('2d')

    // canvas_lighting_ctx.fillStyle='rgba(0,0,0,1)'
    // canvas_lighting_ctx.globalCompositeOperation = 'source-over'
    // canvas_lighting_ctx.fillRect(0,0,canvas_lighting.width,canvas_lighting.height)

    // // fill the lighting canvas with the amount of "natual light"
    // canvas_lighting_ctx.fillStyle="rgba(0,0,0,.1)";
    // canvas_lighting_ctx.globalCompositeOperation = 'destination-out'
    // canvas_lighting_ctx.fillRect(0,0,canvas_lighting.width,canvas_lighting.height)


    createjs.Ticker.addListener(window);
    createjs.Ticker.setFPS(30);

    lightingEngine = new LightingEngine(canvas_lighting,canvas_main,natural_light)

    var light1 = lightingEngine.addLight(new Light(canvas_lighting, {intensity:90, flicker:3}))
    light1.x = 353
    light1.y = 309

    var light2 = lightingEngine.addLight(new Light(canvas_lighting, {intensity:90, flicker:3}))
    light2.x = 674
    light2.y = 115

    var light3 = lightingEngine.addLight(new Light(canvas_lighting, {intensity:90, flicker:3}))
    light3.x = 607
    light3.y = 422

    var light4 = lightingEngine.addLight(new Light(canvas_lighting, {intensity:90, flicker:3}))
    light4.x = 149
    light4.y = 498


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
        initMap();


        ctx = canvas.getContext("2d");
        ctx.lineWidth = lighting_ray_width
        ctx.strokeStyle = 'rgba(255,255,255,.5)'

        // ctx.strokeStyle = '#fff'

        initRayCaster();
        initGameBindings();
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

        me.moved()
    }).bind('click',function(e) {
        me.fire(e);
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

        if($('input:focus').length==0 && e.keyCode >= 37 && e.keyCode <= 40) return false
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

        if(input.mouse[0]) {
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

    // lightingEngine.renderFirstWave(natural_light);


    if(connected && use_lighting) draw()
    // lightingEngine.renderSecondWave(natural_light);
    // lightingEngine.transfer()

    // garbage collection
    garbage.map(function(el, i, ary) {
        delete garbage.pop();
    })
}

























