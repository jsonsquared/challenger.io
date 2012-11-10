var tileSize = 32;
var moveDistance = 5;
var stage, canvas;
var walls = [];
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
    // players = [
    //     new Player({name:'test1', x:200, y:200, rotation:20, me:true}),
    //     new Player({name:'test2', x:300, y:200, rotation:20}),
    //     new Player({name:'test2', x:400, y:200, rotation:50})
    // ]


    console.log(instance.players)
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
    })

    setInterval(function() {
        if(input.keyboard[87]) { me.moveUp() } // W
        if(input.keyboard[65]) { me.moveLeft() } // A
        if(input.keyboard[83]) { me.moveDown() } // S
        if(input.keyboard[68]) { me.moveRight() } // D
    },inputInterval)

    window.tick = function() {
        stage.update();

        if(players) {
            for(var p in players) {
                players[p].updatePosition()
            }
        }

        lightingEngine.render(natural_light);
    }

}

