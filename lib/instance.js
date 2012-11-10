var Player = require('./player');

var Instance = function(id, options) {
    this.id = id;
    this.players = [];

    this.addPlayer = function(id) {
        players.push(new Player(id));
    }

    this.removePlayer = function(id) {
        var index = this.find(id);
        if(index != -1) this.players.splice(index, 1);
    }

    this.find = function(id) {
        for(var i = 0, len = this.players.length; i < len; i++) {
            if(this.players[i].id == id) return i;
        }
        return -1;
    }
};
module.exports = Instance;