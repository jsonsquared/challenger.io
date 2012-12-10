var data = require('../public/assets/map')
var util = require('../lib/util');
var config = require('../config/application');

var mapUtils = {

    parse:function() {
        map = {};
        map.data = data.data;
        map.walls = [];
        map.spawnPoints = [];
        map.blankSpaces = [];

        for(var y=0;y<map.data.length;y++) {
            var row = map.data[y].split('');
            for(var x=0;x<row.length;x++) {

                var tile = map.data[y][x];
                if(tile=='0') {
                    map.walls.push({x:x,y:y})
                }

                if(tile=='S') {
                    map.spawnPoints.push({x:x, y:y})
                }

                if(tile==' ') {
                    map.blankSpaces.push({x:x, y:y})
                }

            }
        }

        map.randomSpawn = function() {
            // var point = map.spawnPoints[util.range(0, map.spawnPoints.length-1)]
            // var x = point.x * config.instance.tile_size + (config.instance.tile_size/2);
            // var y = point.y * config.instance.tile_size + (config.instance.tile_size/2);
            return {x: 464, y: 464}
        }

        return map
    }
}
module.exports = mapUtils;