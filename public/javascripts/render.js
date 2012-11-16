var CLEAR = 1;
var FILL = .4;
var lightLayer;         // easeljs stage for lights. shared between initLights, processRaycasting
var darkmask;           // illumination.js canvas. shared between initLights, processRaycasting
var raycaster = {}      // illumination.js lightsource, position is updated through
var lightLayers = 0;
var light1 = false;
function render() {
    if(!connected || !me) return
    stage_under.update();
    stage_over.update();
    processRaycasting();
    lightingEngine.render()
    lightLayer.draw(canvas_main_ctx)
    crosshairLayer.draw(canvas_main_ctx)
}

function initLights() {
    var objects = []
    raycaster = new illuminated.Lamp({
        position: new illuminated.Vec2(100, 250),
        distance: 350,
        radius: 0,
        samples: 1,
        angle:0
    });

    for(var w = 0; w< mapData.walls.length; w++) {
        objects[objects.length] = new illuminated.RectangleObject({
            topleft: new illuminated.Vec2(mapData.walls[w].x* TILE_SIZE, mapData.walls[w].y* TILE_SIZE),
            bottomright: new illuminated.Vec2(mapData.walls[w].x*TILE_SIZE+TILE_SIZE, mapData.walls[w].y*TILE_SIZE + TILE_SIZE)
        });
    }

    lighting1 = new illuminated.Lighting({
        light: raycaster,
        objects: objects
    });

    darkmask = new illuminated.DarkMask({ lights: [raycaster] });

    lightLayer = new createjs.Bitmap(canvas_lighting)
    stage_under.addChildAt(lightLayer,3)
    crosshairLayer = new createjs.Bitmap(canvas_crosshair)
    stage_under.addChildAt(crosshairLayer,4)
}
function processRaycasting () {

    var touching = lighting1.compute(canvas_lighting.width, canvas_lighting.height);
    darkmask.compute(canvas_lighting.width, canvas_lighting.height);

    canvas_lighting_ctx.globalCompositeOperation = "source-out";
    canvas_lighting_ctx.fillStyle = "rgba(0,0,0,1)";
    canvas_lighting_ctx.fillRect(0, 0, canvas_lighting.width, canvas_lighting.height);

    canvas_lighting_ctx.globalCompositeOperation = "destination-out";
    lighting1.render(canvas_lighting_ctx);

    canvas_lighting_ctx.fillStyle = "rgba(0,0,0," + FILL + ")";

    if(CLEAR) {
        for(var o = 0; o< touching.length; o++) {
           canvas_lighting_ctx.clearRect(touching[o].points[0].x, touching[o].points[0].y, TILE_SIZE, TILE_SIZE)
           canvas_lighting_ctx.fillRect(touching[o].points[0].x, touching[o].points[0].y, TILE_SIZE, TILE_SIZE)
       }
    }

    canvas_lighting_ctx.globalCompositeOperation = "destination-over";
    darkmask.render(canvas_lighting_ctx);
}