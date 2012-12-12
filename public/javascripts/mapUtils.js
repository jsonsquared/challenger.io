var map = {};
var tileset = {
    img:null,
    width:null,
    height:null,
    tiles:[]
}
var mapGroup;
var tilesThatBlockView = []
var tilesThatBlockMovement = []
var texture;
function loadMap(map, callback) {
    var arr = [];

    $.get('/assets/maps/' + map + '.json', function(data) {

        img = new Image()
        img.src = data.tilesets[0].image.replace('../','../assets/')
        img.onload = function() {

            tileset.img = this;
            tileset.width = this.width / TILE_SIZE
            tileset.height = this.height / TILE_SIZE

            // extract tile properties
            $.each(data.tilesets[0].tileproperties, function(key) {

                if(this.hasOwnProperty('blocksView')) {
                    tilesThatBlockView.push(parseInt(key)+1)
                }

                if(this.hasOwnProperty('blocksMovement')) {
                    tilesThatBlockMovement.push(parseInt(key)+1)
                }

                tileset.tiles.push(new THREE.Texture(spriteFromTileset(key)))

            })

            for(var y = 0;y < data.height; y++) {
                arr[y] = []
                for(var x = 0; x< data.width; x++) {
                    arr[y][x] = data.layers[0].data[y * data.height + x]
                }
            }

            // create a container
            var geometry = new THREE.CubeGeometry(0,0,0);
            var material = Physijs.createMaterial(new THREE.MeshLambertMaterial(),.8,.4);
            mapGroup = new Physijs.BoxMesh(geometry, material,0)

            // add the floor
            // var geometry = new THREE.CubeGeometry( map.data[0].length * TILE_SIZE, map.data.length * TILE_SIZE, 16 );
            // var texture = THREE.ImageUtils.loadTexture( '/assets/images/rocks.jpg' );
            // var material = Physijs.createMaterial(new THREE.MeshLambertMaterial( { map: texture }),.8,.4);
            // var floor = physics ? new Physijs.BoxMesh(geometry, material,0) : new THREE.Mesh( geometry, material );
            // floor.position.x=map.data[0].length * TILE_SIZE / 2
            // floor.position.y=map.data.length * TILE_SIZE / 2 * -1
            // floor.position.z = 9;
            // mapGroup.add( floor );

            scene.add(mapGroup)

            // return mapGroup

            callback(arr)
        }
    });
}

function spriteFromTileset(tile) {

    var canvas = document.createElement('canvas')
    canvas.width = 16;
    canvas.height = 16;
    var sourceY = Math.floor(tile / tileset.width)
    var sourceX = tile - sourceY * tileset.width

    canvas.getContext('2d').drawImage(tileset.img, sourceX * TILE_SIZE, sourceY * TILE_SIZE, TILE_SIZE, TILE_SIZE, 0, 0, TILE_SIZE, TILE_SIZE)

    return canvas
}

function tileBlocksView(tile) {
    return $.inArray(tile, tilesThatBlockView) >-1
}


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