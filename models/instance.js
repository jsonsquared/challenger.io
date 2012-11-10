var Player = require('./player');

var Instance = function(id, options) {
    id = id;
    players = [];

    addPlayer = function(id) {
        players.push(new Player(id));
    }

};
module.exports = Instance;