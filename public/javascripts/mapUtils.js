function loadMap(map, callback) {
    var arr = [];

    $.get('/assets/maps/' + map + '.json', function(data) {
        for(var y = 0;y < data.height; y++) {
            arr[y] = []
            for(var x = 0; x< data.width; x++) {
                arr[y][x] = data.layers[0].data[y * data.height + x]
            }
        }
        callback(arr)
    })
}

function blocked(x, y, fx, fy) {

    var tileX = Math.floor((x)/TILE_SIZE)
    var tileY = Math.floor((y)/TILE_SIZE)

    if(tileY < 0 || tileY > map.data.length-1 || tileX < 0 || tileX > map.data[0].length-1) return false

    return $.inArray(map.data[tileY][tileX],tilesThatBlockMovement) > -1
}