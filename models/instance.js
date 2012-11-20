var config = require('../config/application')
var Player = require('./player');
var Item = require('./item');
var util = require('../lib/util');
require('../public/javascripts/lib/jsonHelpers');
var initPacketHandler = require('../lib/packets.js');
var initMainloop = require('../lib/mainloop.js');

var Instance = function(id) {
    var self = this;

    this.id = id;
    this.players = {};
    this.items = {};
    this.iio;
    this.kills = 0;
    this.map = require('../lib/mapUtils').parse()
    this.state = 'running';
    this.iio = initPacketHandler(this)
    this.mainloop = initMainloop(this)

    this.addPlayer = function(id, name) {
        var player = new Player(id, name);
        this.players[id] = player;
        return player;
    }

    this.removePlayer = function(id) {
        this.kills = this.kills - this.players[id].killCount;
        delete this.players[id]
    }

    this.addItem = function(options) {
        var id = (new Date()).getTime() + util.range(1000,9999)
        this.items[id] = new Item(options)
        this.items[id].id = id;
        self.iio.emit('addItem', packetSafe(this.items[id]))

        return this.items[id]
    }

    this.removeItem = function(id) {
        if(this.items[id]) {
            self.iio.emit('removeItem', id)
            delete this.items[id]
        }
    }

    this.randomSpawn = function() {
        var point = this.map.spawnPoints[util.range(0, this.map.spawnPoints.length-1)]
        var x = point.x * config.instance.tile_size + (config.instance.tile_size/2);
        var y = point.y * config.instance.tile_size + (config.instance.tile_size/2);
        return {x: x, y: y}
    }

    this.full = function() {
        return Object.keys(this.players).length >= config.instance.player_limit
    }

    this.playerList = function() {
        var playerNames = [];
        for(var p = 0, plen = Object.keys(this.players).length; p < plen; p++) {
            var player = this.players[Object.keys(this.players)[p]];
            playerNames.push(player.name)
        }
        return playerNames;
    }

    this.gameover = function() {
        return this.kills == KILL_TOTAL;
    }

    this.newGame = function() {
        self.kills = 0;
        for(var p = 0, plen = Object.keys(this.players).length; p < plen; p++) {
            var player = this.players[Object.keys(this.players)[p]];
            player.reset(player.id, player.name);
            player.setPosition(self.randomSpawn())
            player.respawn();
        }
    }

    this.data = function() {
        return {
            id: this.id,
            players: this.players,
            items: packetSafe(this.items),
            score: this.kills,
            state: this.state
        }
    }

};
module.exports = Instance;