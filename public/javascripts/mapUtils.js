function initMap() {

    for(var y=0;y<map.data.length;y++) {
        var row = map.data[y].split('');
        for(var x=0;x<row.length;x++) {

            var tile = map.data[y][x];
            if(tile=='0') {
                mapData.walls.push({x:x,y:y})
            }

            if(tile=='1') {
                mapData.halfWalls.push({x:x, y:y})
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