var CLEAR = 1;
var FILL = .5;
var lightLayer;         // easeljs stage for lights. shared between initLights, processRaycasting
var darkmask;           // illumination.js canvas. shared between initLights, processRaycasting
var raycaster = {}      // illumination.js lightsource, position is updated through
var lightLayers = 0;
var lights= [];
var myLighting
var lighting= [];
function render() {
    if(!connected || !me) return
    stage_under.update();
    stage_over.update();
    processRaycasting();
    lightLayer.draw(canvas_main_ctx)
    crosshairLayer.draw(canvas_main_ctx)
}

function initLights() {
    var objects = []
    raycaster = new illuminated.Lamp({
        position: new illuminated.Vec2(100, 250),
        distance: 250,
        radius: 125,
        samples: 1,
        angle:0
    });

    for(var w = 0; w< mapData.walls.length; w++) {
        objects[objects.length] = new illuminated.RectangleObject({
            topleft: new illuminated.Vec2(mapData.walls[w].x* TILE_SIZE, mapData.walls[w].y* TILE_SIZE),
            bottomright: new illuminated.Vec2(mapData.walls[w].x*TILE_SIZE+TILE_SIZE, mapData.walls[w].y*TILE_SIZE + TILE_SIZE)
        });
    }

    myLighting = new illuminated.Lighting({
        light: raycaster,
        objects: objects
    });


    // street lights
    lights.push(new illuminated.Lamp({position: new illuminated.Vec2(672, 115),distance: 150,radius: 75,samples: 1,angle:0}));
    lighting.push(new illuminated.Lighting({light: lights[lights.length-1],objects:objects}))

    lights.push(new illuminated.Lamp({position: new illuminated.Vec2(353, 305),distance: 150,radius: 75,samples: 1,angle:0}));
    lighting.push(new illuminated.Lighting({light: lights[lights.length-1],objects:objects}))

    lights.push(new illuminated.Lamp({position: new illuminated.Vec2(149, 496),distance: 150,radius: 75,samples: 1,angle:0}));
    lighting.push(new illuminated.Lighting({light: lights[lights.length-1],objects:objects}))

    lights.push(new illuminated.Lamp({position: new illuminated.Vec2(609, 415),distance: 150,radius: 75,samples: 1,angle:0}));
    lighting.push(new illuminated.Lighting({light: lights[lights.length-1],objects:objects}))

    for(l = 0;l<lighting.length;l++) {
        lighting[l].compute(canvas_lighting.width, canvas_lighting.height);
    }

    lights.push(raycaster)

    darkmask = new illuminated.DarkMask({
        lights: lights,
        color: 'rgba(0,0,0,.9)'
    });

    lightLayer = new createjs.Bitmap(canvas_lighting)
    stage_under.addChildAt(lightLayer,3)
    crosshairLayer = new createjs.Bitmap(canvas_crosshair)
    stage_under.addChildAt(crosshairLayer,4)

}

function processRaycasting () {

    canvas_lighting_ctx.fillStyle = "rgba(0,0,0,.2)";
    canvas_lighting_ctx.fillRect(0, 0, canvas_lighting.width, canvas_lighting.height);

    canvas_lighting_ctx.globalCompositeOperation = "destination-out";
    canvas_lighting_ctx.fillRect(0, 0, canvas_lighting.width, canvas_lighting.height);
    myLighting.compute(canvas_lighting.width, canvas_lighting.height);
    myLighting.render(canvas_lighting_ctx);

    for(var l = 0; l < lighting.length; l++) {
        lighting[l].render(canvas_lighting_ctx);
    }

    canvas_lighting_ctx.globalCompositeOperation = "source-over"

    darkmask.compute(canvas_lighting.width, canvas_lighting.height);
    darkmask.render(canvas_lighting_ctx);
}
var A = true