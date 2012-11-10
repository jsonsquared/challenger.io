var tileSize = 32;
var moveDistance = 5;
var stage, canvas;
var walls = [];
var garbage = [];
var players = {};
var inputInterval = 20;
var natural_light = .75;
var canvas_main, canvas_lighting;
var crosshair, crosshairX, crosshairY;
var me;

$(function() {
    canvas_main = document.getElementById("canvas-main");
    canvas_lighting = document.getElementById("canvas-lighting");
    stage = new createjs.Stage(canvas_main);
    stage.autoClear = true;

    canvas_main.width = canvas_lighting.width = map[0].length * tileSize
    canvas_main.height = canvas_lighting.height = map.length * tileSize
    parseMap();

    createjs.Ticker.addListener(window);
    createjs.Ticker.setFPS(30);

    lightingEngine = new LightingEngine(
        document.getElementById('canvas-lighting'),
        document.getElementById('canvas-main'),
        .5
    )

    testlight = new Light(canvas_lighting, {intensity:50});

    crosshair = new createjs.Shape();
    crosshair.graphics.f('#F0F').de(0,0,20,20,30);
    stage.addChild(crosshair)

});


function findPlayer(id) {
    for(var i = 0, len = players.length; i < len; i++) {
        if(players[i].id == id) return i;
    }
    return -1;
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
        crosshairX = e.offsetX - 10;
        crosshairY = e.offsetY - 10;

        var deltaX = crosshairX - me.container.x
        var deltaY = crosshairY - me.container.y
        crosshair.x = crosshairX;
        crosshair.y = crosshairY

        // The resulting direction
        me.rotation = Math.atan2(deltaY, deltaX) / Math.PI * 180;
        me.moved()
    }).bind('click',function(e) {

        var b = new Bullet({
            x:me.x, //dualWield ? (Math.round(Math.random()) == 1 ? me.x-20 : me.x+17) : me.x,
            y:me.y,
            endX: e.offsetX,
            endY: e.offsetY
        })

        b.onRemove = function() {
            garbage.push(b);
        };
    })

    $('body').bind('mousedown', function(e) {
        e.preventDefault()
    })




    setInterval(function() {
        var move = {};
        if(input.keyboard[87]) { move.y = me.y - moveDistance }
        if(input.keyboard[65]) { move.x = me.x - moveDistance }
        if(input.keyboard[83]) { move.y = me.y + moveDistance }
        if(input.keyboard[68]) { move.x = me.x + moveDistance }
        if(move.x || move.y) me.move(move)
    },inputInterval)

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

