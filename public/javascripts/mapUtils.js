function parseMap() {

    var mapImage = new Image();
    mapImage.src = '/assets/images/map.jpg'
    mapImage.onload = function() {
        var bitmap = new createjs.Shape()
        bitmap.graphics.beginBitmapFill(this).drawRect(0, 0, canvas_main.width, canvas_main.height);
        bitmap.x = 0;
        bitmap.y = 0;

        stage.addChild(bitmap)

        for(var y=0;y<map.length;y++) {
            var row = map[y].split('');
            for(var x=0;x<row.length;x++) {

                var tile = map[y][x];
                if(tile=='0') {
                    var sprite = new createjs.Shape();
                    sprite.graphics.beginFill('#FFF').rect(0,0,tileSize,tileSize)
                    sprite.x = x * tileSize
                    sprite.y = y * tileSize
                    walls.push({x:x,y:y,sprite: sprite})
                    stage.addChild(sprite)
                }
            }
        }
    }
}

function blocked(x, y, method) {
    var tileX = method == 1 ? Math.ceil(x/tileSize) : Math.floor(x/tileSize)
    var tileY = method == 1 ? Math.ceil(y/tileSize) : Math.floor(y/tileSize)
    if(tileY < 0 || tileY > map.length-1 || tileX < 0 || tileX > map[0].length-1) return false

    return map[tileY][tileX] == '0'
}