function renderViewport(x,y,force) {
    if(!stage) return false;

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

    viewport_ctx.fillStyle = 'rgba(200,200,200,.5)'
    // floodFill(~~(me.x/16),~~(me.y/16))


    lastViewportRender = {x:x,y:y}
    return true;
}

function floodFill(startX, startY) {

    var newPos,
        x,
        y,
        pixelPos,
        reachLeft,
        reachRight,
        drawingBoundLeft = 0,
        drawingBoundTop = 0,
        drawingBoundRight = CAMERA_WIDTH - 1,
        drawingBoundBottom = CAMERA_HEIGHT - 1,
        canvasWidth = map.data.length;
        canvasHeight = map.data[0].length;
        pixelStack = [[startX, startY]];

    while (pixelStack.length) {

        newPos = pixelStack.pop();
        x = newPos[0];
        y = newPos[1];
        // console.log(x,y,map.data[y][x])
        // Get current pixel position
        //pixelPos = (y * canvasWidth + x) * 4;
        // Go up as long as the color matches and are inside the canvas
        while (y >= drawingBoundTop && !tileBlocksView(map.data[y-1][x])) {
            y -= 1;
            //pixelPos -= canvasWidth * 4;
        }

        //pixelPos += canvasWidth * 4;
        y += 1;
        reachLeft = false;
        reachRight = false;

        // Go down as long as the color matches and in inside the canvas
        while (y <= drawingBoundBottom && !tileBlocksView(map.data[y+1][x])) {
            y += 1;

            //colorPixel(pixelPos, curColor.r, curColor.g, curColor.b);
            viewport_ctx.fillRect(x,y,16,16)
            // draw light

            if (x > drawingBoundLeft) {
                if (!tileBlocksView(map.data[y][x-1])) {
                    if (!reachLeft) {
                        // Add pixel to stack
                        pixelStack.push([x - 1, y]);
                        reachLeft = true;
                    }
                } else if (reachLeft) {
                    reachLeft = false;
                }
            }

            if (x < drawingBoundRight) {
                if (!tileBlocksView(map.data[y][x+1])) {
                    if (!reachRight) {
                        // Add pixel to stack
                        pixelStack.push([x + 1, y]);
                        reachRight = true;
                    }
                } else if (reachRight) {
                    reachRight = false;
                }
            }

            //pixelPos += canvasWidth * 4;
        }
    }
}

function renderBuffer(x,y) {


    if(x==lastBufferRender.x && y==lastBufferRender.y) return;

    var walls = [];

    for(var yy=0;yy<CAMERA_HEIGHT+1;yy++) {
        for(var xx=0;xx<CAMERA_WIDTH+1;xx++) {
            var tile = map.data[yy + cameraY][xx + cameraX];
            renderTile(base_ctx, tile-1, xx*TILE_SIZE,yy*TILE_SIZE)
            if($.inArray(tile, tilesThatBlockView) >-1) walls[walls.length] = {x:xx, y:yy}
        }
    }

    lastBufferRender = {x:x, y:y}

    return walls;

}

function processSolids(solids) {
    var objects = []
    for(var w = 0; w< solids.length; w++) {

        var x = solids[w].x
        var y = solids[w].y

        objects[objects.length] = new illuminated.RectangleObject({
            topleft: new illuminated.Vec2(x*TILE_SIZE, y*TILE_SIZE),
            bottomright: new illuminated.Vec2(x*TILE_SIZE+TILE_SIZE, y*TILE_SIZE + TILE_SIZE)
        });
    }
    return objects;
}

function processLights(solids,x,y) {
    if(!me) return

    if(lastLightRender.x == x && lastLightRender.y ==y) return false;

    light.position.x = ~~(CAMERA_WIDTH+1) * TILE_SIZE / 2 + x-(TILE_SIZE-1);
    light.position.y = ~~(CAMERA_HEIGHT+1) * TILE_SIZE / 2 + y-(TILE_SIZE-1);

    lighting.objects = solids;

    touching = lighting.compute((CAMERA_WIDTH+1) * TILE_SIZE, (CAMERA_HEIGHT+1) * TILE_SIZE);

    lighting_ctx.fillStyle = 'rgba(0,0,0,1)'
    lighting_ctx.globalCompositeOperation = 'source-over'
    lighting_ctx.fillRect(0,0,(CAMERA_WIDTH+1) * TILE_SIZE, (CAMERA_HEIGHT+1) * TILE_SIZE)
    //
    lighting_ctx.fillStyle="rgba(0,0,0,.1)";
    lighting_ctx.globalCompositeOperation = 'destination-out'
    lighting_ctx.fillRect(0,0,(CAMERA_WIDTH+1) * TILE_SIZE, (CAMERA_HEIGHT+1) * TILE_SIZE)

    lighting.render(lighting_ctx);
    lighting.render(lighting_ctx);

    lastLightRender = {x:x,y:y}
    lighting_ctx.globalCompositeOperation = 'lighter'

    // $.each(touching,function() {
    //
    //     lighting_ctx.clearRect(this.topleft.x, this.topleft.y,TILE_SIZE,TILE_SIZE)
    //     var dist = distance({x:this.topleft.x-x%16, y:this.topleft.y-y%TILE_SIZE}, {x:CAMERA_WIDTH * TILE_SIZE / 2,y:CAMERA_HEIGHT * TILE_SIZE / 2}) / VIEW_DISTANCE
    //     lighting_ctx.fillStyle="rgba(0,0,0," + Math.min(.9,dist) + ")";
    //     lighting_ctx.fillRect(this.topleft.x, this.topleft.y,TILE_SIZE,TILE_SIZE)
    //
    // });


}