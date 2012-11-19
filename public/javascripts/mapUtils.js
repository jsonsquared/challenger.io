function initMap() {

    var bitmap = new createjs.Shape()
    bitmap.graphics.beginBitmapFill(assets.map.img).drawRect(0, 0, canvas_main.width, canvas_main.height,0,0,canvas_main.width/2, canvas_main.height/2);
    bitmap.x = 0;
    bitmap.y = 0;

    stage_under.addChildAt(bitmap,0)

    for(var y=0;y<map.data.length;y++) {
        var row = map.data[y].split('');
        for(var x=0;x<row.length;x++) {

            var tile = map.data[y][x];
            if(tile=='0') {
                var sprite = new createjs.Shape();
                sprite.graphics.beginFill('#aaa').rect(0,0,TILE_SIZE,TILE_SIZE)
                sprite.x = x * TILE_SIZE;
                sprite.y = y * TILE_SIZE;
                sprite.alpha = .5
                mapData.walls.push({x:x,y:y,sprite: sprite})
            }

            if(tile=='1') {
                var sprite = new createjs.Shape();
                sprite.graphics.beginFill('#F00').rect(0,0,TILE_SIZE,TILE_SIZE)
                sprite.x = x * TILE_SIZE
                sprite.y = y * TILE_SIZE
                sprite.alpha = .5
                mapData.halfWalls.push({x:x, y:y, sprite:sprite})
            }
        }
    }
}

function blocked(x, y, method) {
    var tileX = method == 1 ? Math.ceil((x)/TILE_SIZE) : Math.floor((x)/TILE_SIZE)
    var tileY = method == 1 ? Math.ceil((y)/TILE_SIZE) : Math.floor((y)/TILE_SIZE)
    if(tileY < 0 || tileY > map.data.length-1 || tileX < 0 || tileX > map.data[0].length-1) return false

    return map.data[tileY][tileX] == '0'
}

function halfBlocked(x, y, method) {
    var tileX = method == 1 ? Math.ceil(x/TILE_SIZE) : Math.floor(x/TILE_SIZE)
    var tileY = method == 1 ? Math.ceil(y/TILE_SIZE) : Math.floor(y/TILE_SIZE)
    if(tileY < 0 || tileY > map.data.length-1 || tileX < 0 || tileX > map.data[0].length-1) return false

    return map.data[tileY][tileX] == '1'
}