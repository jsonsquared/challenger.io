var game = require('../config/game.config');

var Map = function(path) {
    if(!path) throw new Error('path is required to create a map');

    this.rawData = require(path);
    this.walls = [];
    this.spawnPoints = [];
    this.blankSpaces = [];

    this.parse = function() {
        for(var y=0;y<this.rawData.length;y++) {
            var row = this.rawData[y].split('');
            for(var x=0;x<row.length;x++) {

                var tile = this.rawData[y][x];
                if(tile=='0') {
                    this.walls.push({x:x,y:y})
                }

                if(tile=='S') {
                    this.spawnPoints.push({x:x, y:y})
                }

                if(tile==' ') {
                    this.blankSpaces.push({x:x, y:y})
                }

            }
        }
    },

    this.randomSpawn = function() {
        var point = this.spawnPoints[Math.round(Math.random() * (this.spawnPoints.length - 1))]
        var x = point.x * game.instance.tile_size + (game.instance.tile_size / 2);
        var y = point.y * game.instance.tile_size + (game.instance.tile_size / 2);
        return {x: x, y: y}
    }

    this.parse();
}
module.exports = Map;