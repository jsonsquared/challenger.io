var tileset = {
    img:null,
    width:null,
    height:null
}
var tilesThatBlockView = []
var tilesThatBlockMovement = []

function loadMap(map, callback) {
    var arr = [];

    $.get('/assets/maps/' + map + '.json', function(data) {

        // extract tile properties
        $.each(data.tilesets[0].tileproperties, function(key) {

            if(this.hasOwnProperty('blocksView')) {
                tilesThatBlockView.push(parseInt(key)+1)
            }

            if(this.hasOwnProperty('blocksMovement')) {
                tilesThatBlockMovement.push(parseInt(key)+1)
            }

        })

        img = new Image()
        img.src = data.tilesets[0].image.replace('../','../assets/')
        img.onload = function() {

            tileset.img = this;
            tileset.width = this.width / TILE_SIZE
            tileset.height = this.height / TILE_SIZE

            for(var y = 0;y < data.height; y++) {
                arr[y] = []
                for(var x = 0; x< data.width; x++) {
                    arr[y][x] = data.layers[0].data[y * data.height + x]
                }
            }
            callback(arr)
        }
    });
}

function raycast (x1,y1,x2,y2) {
    var coordinatesArray = new Array();
    // Define differences and error check
    var dx = Math.abs(x2 - x1);
    var dy = Math.abs(y2 - y1);
    var sx = (x1 < x2) ? 1 : -1;
    var sy = (y1 < y2) ? 1 : -1;
    var err = dx - dy;
    // Set first coordinates
    coordinatesArray.push({y:y1, x:x1});
    // Main loop
    while (!((x1 == x2) && (y1 == y2))) {
      var e2 = err << 1;
      if (e2 > -dy) {
        err -= dy;
        x1 += sx;
      }
      if (e2 < dx) {
        err += dx;
        y1 += sy;
      }
      // Set coordinates
      coordinatesArray.push({y:y1, x:x1});
    }
    // Return the result
    return coordinatesArray;
}

function renderTile(ctx, tile, x, y) {

    var sourceY = Math.floor(tile / tileset.width)
    var sourceX = tile - sourceY * tileset.width

    ctx.drawImage(tileset.img,sourceX* TILE_SIZE,sourceY* TILE_SIZE,TILE_SIZE,TILE_SIZE,x,y,TILE_SIZE,TILE_SIZE)
}

function blocked(x, y, fx, fy) {

    var tileX = Math.floor((x)/TILE_SIZE)
    var tileY = Math.floor((y)/TILE_SIZE)

    if(tileY < 0 || tileY > map.data.length-1 || tileX < 0 || tileX > map.data[0].length-1) return false

    return $.inArray(map.data[tileY][tileX],tilesThatBlockMovement) > -1
}