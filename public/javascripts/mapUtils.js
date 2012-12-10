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

        console.log(data.tilesets[0].tileproperties)

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