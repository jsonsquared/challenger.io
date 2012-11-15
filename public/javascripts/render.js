var CLEAR = 1;
var FILL = .4;
var lightLayer;         // easeljs stage for lights. shared between initLights, processRaycasting
var darkmask;           // illumination.js canvas. shared between initLights, processRaycasting
var raycaster = {}      // illumination.js lightsource, position is updated through
var lightLayers = 0;
function render() {
    if(!connected || !me) return
    stage.update();
    crosshair_stage.update();
    lightingEngine.render()
    processRaycasting();
    // for(var l = 0;l<lightLayers;l++) {
        lightLayer.draw(canvas_main_ctx)
    // }
    crosshairLayer.draw(canvas_main_ctx)
}

function initLights() {
    var objects = []
    raycaster = new illuminated.Lamp({
        position: new illuminated.Vec2(100, 250),
        distance: 400,
        radius: 0,
        samples: 1,
        angle:0
    });


    for(var w = 0; w< walls.length; w++) {
        objects[objects.length] = new illuminated.RectangleObject({
            topleft: new illuminated.Vec2(walls[w].x* tileSize, walls[w].y* tileSize),
            bottomright: new illuminated.Vec2(walls[w].x*tileSize+tileSize, walls[w].y*tileSize + tileSize)
        });
    }

    lighting1 = new illuminated.Lighting({
        light: raycaster,
        objects: objects
    });

    darkmask = new illuminated.DarkMask({ lights: [raycaster] });

    lightLayer = new createjs.Bitmap(canvas_lighting)
    stage.addChildAt(lightLayer,3)
    crosshairLayer = new createjs.Bitmap(canvas_crosshair)
    stage.addChildAt(crosshairLayer,4)
}
function processRaycasting () {

    var touching = lighting1.compute(canvas_lighting.width, canvas_lighting.height);
    darkmask.compute(canvas_lighting.width, canvas_lighting.height);

    canvas_lighting_ctx.globalCompositeOperation = "source-out";
    canvas_lighting_ctx.fillStyle = "rgba(0,0,0,.5)";
    canvas_lighting_ctx.fillRect(0, 0, canvas_lighting.width, canvas_lighting.height);

    canvas_lighting_ctx.globalCompositeOperation = "destination-out";
    lighting1.render(canvas_lighting_ctx);

    canvas_lighting_ctx.fillStyle = "rgba(0,0,0," + FILL + ")";

    if(CLEAR) {
        for(var o = 0; o< touching.length; o++) {
           canvas_lighting_ctx.clearRect(touching[o].points[0].x, touching[o].points[0].y, tileSize, tileSize)
           canvas_lighting_ctx.fillRect(touching[o].points[0].x, touching[o].points[0].y, tileSize, tileSize)
       }
    }
    canvas_lighting_ctx.globalAlpha = .9
    canvas_lighting_ctx.globalCompositeOperation = "destination-over";
    darkmask.render(canvas_lighting_ctx);
}