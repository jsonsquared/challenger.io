function initMap() {

    var bitmap = new createjs.Shape()
    bitmap.graphics.beginBitmapFill(assets.map.img).drawRect(0, 0, canvas_main.width, canvas_main.height,0,0,canvas_main.width/2, canvas_main.height/2);
    bitmap.x = 0;
    bitmap.y = 0;

    console.log(stage)
    stage.addChildAt(bitmap,0)

    for(var y=0;y<map.length;y++) {
        var row = map[y].split('');
        for(var x=0;x<row.length;x++) {

            var tile = map[y][x];
            if(tile=='0') {
                var sprite = new createjs.Shape();
                sprite.graphics.beginFill('#aaa').rect(0,0,tileSize,tileSize)
                sprite.x = x * tileSize;
                sprite.y = y * tileSize;
                sprite.alpha = .5
                walls.push({x:x,y:y,sprite: sprite})
            }

            if(tile=='1') {
                var sprite = new createjs.Shape();
                sprite.graphics.beginFill('#F00').rect(0,0,tileSize,tileSize)
                sprite.x = x * tileSize
                sprite.y = y * tileSize
                sprite.alpha = .5
                halfWalls.push({x:x, y:y, sprite:sprite})
            }

            if(tile=='S') {
                spawnPoints.push({x:x, y:y})
            }
        }
    }
}

function blocked(x, y, method) {
    var tileX = method == 1 ? Math.ceil((x)/tileSize) : Math.floor((x)/tileSize)
    var tileY = method == 1 ? Math.ceil((y)/tileSize) : Math.floor((y)/tileSize)
    if(tileY < 0 || tileY > map.length-1 || tileX < 0 || tileX > map[0].length-1) return false

    return map[tileY][tileX] == '0'
}

function halfBlocked(x, y, method) {
    var tileX = method == 1 ? Math.ceil(x/tileSize) : Math.floor(x/tileSize)
    var tileY = method == 1 ? Math.ceil(y/tileSize) : Math.floor(y/tileSize)
    if(tileY < 0 || tileY > map.length-1 || tileX < 0 || tileX > map[0].length-1) return false

    return map[tileY][tileX] == '1'
}