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
var natural_light = .75;
var pushFrequency = 50;
var rateOfFire = 130;
var recoil = 0;
var canvas_main, canvas_lighting;
var crosshair, crosshairX, crosshairY;
var me;
var lastPush = {x:-1, y:-1, rotation:-1};
var USE_SOUNDS = false;

var assets = {
    'map'   :  '/assets/images/map.jpg',
    'bullet':  '/assets/images/bullet.png',
    'crosshair': '/assets/images/crosshair.png'
};

$(function() {
    canvas_main = document.getElementById("canvas-main");
    canvas_lighting = document.getElementById("canvas-lighting");
    stage = new createjs.Stage(canvas_main);
    stage.autoClear = true;

    canvas_main.width = canvas_lighting.width = map[0].length * tileSize
    canvas_main.height = canvas_lighting.height = map.length * tileSize

    createjs.Ticker.addListener(window);
    createjs.Ticker.setFPS(30);

    lightingEngine = new LightingEngine(canvas_lighting,canvas_main,natural_light)

    parseMap();
});

function updateLeaderboard() {
    leaderboard = [];
    for(var i = 0, len = Object.keys(players).length; i < len; i++) {
        leaderboard.push(players[Object.keys(players)[i]]);
    }

    $("#leaderboard table tbody").html('');

    leaderboard = leaderboard.sort(function(a, b) { return b.killCount - a.killCount});

    for(var i = 0, len = leaderboard.length; i < len; i++) {
        var player = leaderboard[i];
        $("#leaderboard table tbody").append('<tr><td>'+ player.name +'</td><td>'+ player.killCount +'</td></tr>')
    }
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

    $(canvas_main).bind('mousemove', function(e) {
        crosshair.sprite.x = e.offsetX - 10;
        crosshair.sprite.y = e.offsetY - 10;

        me.moved()
    }).bind('click',function(e) {
        me.fire(e);
    })

    $('body').bind('mousedown', function(e) {
        e.preventDefault()
    })

    $('body').bind('mouseup', function(e) {
        e.preventDefault()
        recoil = 0;
    })

    setInterval(function() {
        if(lastPush.x != me.payload.x || lastPush.y != me.payload.y || lastPush.rotation != me.payload.rotation) {
            socket.emit('move', me.payload)
            lastPush = me.payload;
        }
    },pushFrequency)

    setInterval(function() {
        var move = {};
        if($('input:focus').length==0) {
            if(input.keyboard[87]) { move.y = me.y - moveDistance }
            if(input.keyboard[65]) { move.x = me.x - moveDistance }
            if(input.keyboard[83]) { move.y = me.y + moveDistance }
            if(input.keyboard[68]) { move.x = me.x + moveDistance }
            if(move.x || move.y) me.move(move)
        }
    },inputInterval)

    setInterval(function() {
        if(input.mouse[0]) {
            me.fire({offsetX:crosshair.sprite.x, offsetY: crosshair.sprite.y})
            recoil+=2
        }
    },rateOfFire)

    $(document).bind('keydown', function(e) {
        if(e.keyCode==13) {
            if($('input:focus').length==0) {
                $('#chat-input').focus();
            } else {
                var msg = $('#chat-input').val()
                console.log(msg)
                socket.emit('say', msg)
                $('#chat-input').blur().val('')
            }
        }

        if(e.keyCode == 82 && $('input:focus').length==0) {
            socket.emit('manual_reload')
        }
    })

    window.tick = function() {
        $(document).trigger('tick')
        stage.update();

        if(players) {
            for(var p in players) {
                players[p].updatePosition()
            }
        }

        lightingEngine.render(natural_light);

        // garbage collection
        garbage.map(function(el, i, ary) {
            delete garbage.pop();
        })
    }

}

