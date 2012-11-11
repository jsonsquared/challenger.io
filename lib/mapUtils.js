var data = require('../public/assets/map')

var mapUtils = {

    parse:function() {
        map = {};
        map.data = data;
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
        return map
    }
}
module.exports = mapUtils;