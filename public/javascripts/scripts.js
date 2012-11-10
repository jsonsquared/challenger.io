var tileSize = 32;
var moveDistance = 5;
var stage, canvas;
var walls = [];
var players = false;
var inputInterval = 20;
var natural_light = .25;
var canvas_main, canvas_lighting;
var crosshair, crosshairX, crosshairY;

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

    players = {
        0: new Player({name:'mcleod', x:6 * tileSize,y:6 * tileSize})
    }

    crosshair = new createjs.Shape();
    crosshair.graphics.f('#F0F').de(0,0,20,20,30);
    stage.addChild(crosshair)

    $(canvas_main).bind('mousemove', function(e) {
        // console.log(e.offsetX, e.offsetY)
        crosshairX = e.offsetX - 10;
        crosshairY = e.offsetY - 10;

        var deltaX = crosshairX - players[0].shape.x
        var deltaY = crosshairY - players[0].shape.y
        crosshair.x = crosshairX;
        crosshair.y = crosshairY

        // The resulting direction
        players[0].rotation = Math.atan2(deltaY, deltaX) / Math.PI * 180;
        players[0].moved()
    })

    setInterval(function() {
        if(input.keyboard[87]) { players[0].moveUp() } // W
        if(input.keyboard[65]) { players[0].moveLeft() } // A
        if(input.keyboard[83]) { players[0].moveDown() } // S
        if(input.keyboard[68]) { players[0].moveRight() } // D
    },inputInterval)

});

window.tick = function() {
    stage.update();

    if(players) {
        for(var p in players) {
            players[p].updatePosition()
        }
    }

    lightingEngine.render(natural_light);
}