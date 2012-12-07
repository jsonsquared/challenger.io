function renderViewport(x,y,force) {
    if(!stage) return false;

    // if(x == lastViewportRender.x && y == lastViewportRender.y && !force) return false;

    // move me to account for offset
    me.container.x = x%TILE_SIZE + (TILE_SIZE * CAMERA_WIDTH / 2)
    me.container.y = y%TILE_SIZE + (TILE_SIZE * CAMERA_HEIGHT / 2)

    // move other players based to account for the camera and mod offsets
    $.each(players, function() {
        if(this==me) return
        this.container.x = this.x + x%TILE_SIZE - camera.x;
        this.container.y = this.y + y%TILE_SIZE - camera.y;
    });

    $.each(stage.elements, function() {
        this.container.x = this.x + x%TILE_SIZE - camera.x;
        this.container.y = this.y + y%TILE_SIZE - camera.y;
    })

    stage_stage.update()

    viewport_ctx.drawImage(base_canvas,x%TILE_SIZE,y%TILE_SIZE, CAMERA_WIDTH * TILE_SIZE, CAMERA_HEIGHT * TILE_SIZE, 0, 0, CAMERA_WIDTH * TILE_SIZE, CAMERA_HEIGHT * TILE_SIZE)
    viewport_ctx.drawImage(stage_canvas,x%TILE_SIZE,y%TILE_SIZE, CAMERA_WIDTH * TILE_SIZE, CAMERA_HEIGHT * TILE_SIZE, 0, 0, CAMERA_WIDTH * TILE_SIZE, CAMERA_HEIGHT * TILE_SIZE)
    viewport_ctx.drawImage(lighting_canvas,x%TILE_SIZE,y%TILE_SIZE, CAMERA_WIDTH * TILE_SIZE, CAMERA_HEIGHT * TILE_SIZE, 0, 0, CAMERA_WIDTH * TILE_SIZE, CAMERA_HEIGHT * TILE_SIZE)

    lastViewportRender = {x:x,y:y}
    return true;
}

function renderBuffer(x,y) {

    if(x==lastBufferRender.x && y==lastBufferRender.y) return;

    var cameraX = Math.floor(x/TILE_SIZE) - Math.floor((CAMERA_WIDTH)/2);
    var cameraY = Math.floor(y/TILE_SIZE) - Math.floor((CAMERA_HEIGHT)/2);

    var walls = [];

    for(var yy=0;yy<CAMERA_HEIGHT+1;yy++) {
        for(var xx=0;xx<CAMERA_WIDTH+1;xx++) {

            var tile = map.data[yy + cameraY][xx + cameraX];
            base_ctx.drawImage(assets.tileset.img,TILE_SIZE*(tile-1),0,TILE_SIZE,TILE_SIZE,xx*TILE_SIZE,yy*TILE_SIZE,TILE_SIZE,TILE_SIZE)

            if($.inArray(tile, tilesThatBlockView) >-1) walls[walls.length] = {x:xx, y:yy}

        }
    }

    lastBufferRender = {x:x, y:y}

    return walls;

}

function processSolids(solids) {
    var objects = []
    for(var w = 0; w< solids.length; w++) {
        objects[objects.length] = new illuminated.RectangleObject({
            topleft: new illuminated.Vec2(solids[w].x * TILE_SIZE, solids[w].y * TILE_SIZE),
            bottomright: new illuminated.Vec2(solids[w].x * TILE_SIZE + TILE_SIZE, solids[w].y * TILE_SIZE + TILE_SIZE)
        });
    }
    return objects;
}

function processLights(solids,x,y) {
    if(!me) return

    if(lastLightRender.x == x && lastLightRender.y ==y) return false;

    light.position.x = (CAMERA_WIDTH+1) * TILE_SIZE / 2 + x
    light.position.y = (CAMERA_HEIGHT+1) * TILE_SIZE / 2 + y

    lighting.objects = solids;

    var touching = lighting.compute((CAMERA_WIDTH+1) * TILE_SIZE, (CAMERA_HEIGHT+1) * TILE_SIZE);

    lighting_ctx.fillStyle = 'rgba(0,0,0,1)'
    lighting_ctx.globalCompositeOperation = 'source-over'
    lighting_ctx.fillRect(0,0,(CAMERA_WIDTH+1) * TILE_SIZE, (CAMERA_HEIGHT+1) * TILE_SIZE)

    lighting_ctx.fillStyle="rgba(0,0,0,.1)";
    lighting_ctx.globalCompositeOperation = 'destination-out'
    lighting_ctx.fillRect(0,0,(CAMERA_WIDTH+1) * TILE_SIZE, (CAMERA_HEIGHT+1) * TILE_SIZE)

    lighting.render(lighting_ctx);
    lighting.render(lighting_ctx);

    lastLightRender = {x:x,y:y}
    lighting_ctx.globalCompositeOperation = 'lighter'
    $.each(solids,function() {
        lighting_ctx.clearRect(this.topleft.x, this.topleft.y,16,16)
        var dist = distance({x:this.topleft.x-x%16, y:this.topleft.y-y%16}, {x:CAMERA_WIDTH * TILE_SIZE / 2,y:CAMERA_HEIGHT * TILE_SIZE / 2}) / VIEW_DISTANCE
        lighting_ctx.fillStyle="rgba(0,0,0," + Math.min(.9,dist) + ")";
        lighting_ctx.fillRect(this.topleft.x, this.topleft.y,16,16)
    });

}


// var lightLayer;         // easeljs stage for lights. shared between initLights, processRaycasting
// var darkmask;           // illumination.js canvas. shared between initLights, processRaycasting
// var myLight = {}      // illumination.js lightsource, position is updated through
// var lights = [];
// var myLighting
// var lighting = [];
// function render() {
//     if(!connected || !me) return
//
//     stage_under.update();
//     stage_over.update();
//     processRaycasting();
//     lightLayer.draw(canvas_main_ctx)
//     crosshairLayer.draw(canvas_main_ctx)
// }
//
// function initLights() {
//     var objects = []
//     myLight = new illuminated.Lamp({
//         position: new illuminated.Vec2(100, 250),
//         distance: 180,
//         radius: 90,
//         samples: 1,
//         angle:0
//     });
//
//     for(var w = 0; w< mapData.walls.length; w++) {
//         objects[objects.length] = new illuminated.RectangleObject({
//             topleft: new illuminated.Vec2(mapData.walls[w].x* TILE_SIZE, mapData.walls[w].y* TILE_SIZE),
//             bottomright: new illuminated.Vec2(mapData.walls[w].x*TILE_SIZE+TILE_SIZE, mapData.walls[w].y*TILE_SIZE + TILE_SIZE)
//         });
//     }
//
//     myLighting = new illuminated.Lighting({
//         light: myLight,
//         objects: objects
//     });
//
//     for(var l=0;l<map.lights.length;l++) {
//         lights.push(new illuminated.Lamp({position: new illuminated.Vec2(map.lights[l].x, map.lights[l].y),distance:map.lights[l].distance,radius: map.lights[l].distance/2,samples: 1,angle:0}));
//         lighting.push(new illuminated.Lighting({light: lights[lights.length-1],objects:objects}))
//     }
//
//     for(l = 0;l<lighting.length;l++) {
//         lighting[l].compute(canvas_lighting.width, canvas_lighting.height);
//     }
//
//     lights.push(myLight)
//
//     darkmask = new illuminated.DarkMask({
//         lights: lights,
//         color: 'rgba(0,0,0,.9)'
//     });
//
//     lightLayer = new createjs.Bitmap(canvas_lighting)
//     stage_under.addChildAt(lightLayer,3)
//     crosshairLayer = new createjs.Bitmap(canvas_crosshair)
//     stage_under.addChildAt(crosshairLayer,4)
//
// }
//
// function processRaycasting () {
//
//     canvas_lighting_ctx.fillStyle = "rgba(0,0,0,.6)";
//     canvas_lighting_ctx.fillRect(0, 0, canvas_lighting.width, canvas_lighting.height);
//
//     canvas_lighting_ctx.globalCompositeOperation = "destination-out";
//     canvas_lighting_ctx.fillRect(0, 0, canvas_lighting.width, canvas_lighting.height);
//     myLighting.compute(canvas_lighting.width, canvas_lighting.height);
//     myLighting.render(canvas_lighting_ctx);
//
//     for(var l = 0; l < lighting.length; l++) {
//         lighting[l].render(canvas_lighting_ctx);
//     }
//
//     canvas_lighting_ctx.globalCompositeOperation = "source-over"
//
//     darkmask.compute(canvas_lighting.width, canvas_lighting.height);
//     darkmask.render(canvas_lighting_ctx);
// }