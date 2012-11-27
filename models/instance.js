var config = require('../config/application')
var Player = require('./player');
var Item = require('./item');
var InstanceItem = require('./instanceItem');
var util = require('../lib/util');
var PacketHandler = require('../lib/packets.js');
var Mainloop = require('../lib/mainloop.js');

var Instance = function(options) {
    var self = this;

    this.id = options.id;
    this.players = {};
    this.items = {};
    this.iio;
    this.kills = 0;
    this.map = require('../lib/mapUtils').parse()
    this.state = 'running';
    this.iio = options.iio || new PacketHandler(this)
    this.mainloop = options.mainloop || new Mainloop(this)

    this.addPlayer = function(id) {
        var player = new Player(id);
        this.players[id] = player;
        return player;
    }

    this.removePlayer = function(id) {
        this.kills = this.kills - this.players[id].killCount;
        self.iio.emit('removePlayer', this.players[id].data());
        delete this.players[id]
    }

    this.addItem = function(options) {
        var item = new InstanceItem(options)
        item.id = util.uid();
        item.instance = self.id;
        item.linkSocket();
        this.items[item.id] = item;
        self.iio.emit('addItem', item.data())
        return this.items[item.id]
    }

    this.useItem = function(id) {
        if(this.items[id]) {
            this.items[id].used = true;
            self.iio.emit('removeItem', id)
        }
    }

    this.removeItem = function(id) {
        if(this.items[id]) {
            delete this.items[id]
        }
    }

    this.increaseKillCount = function() {
        self.kills++;
        self.iio.emit('score', self.data())

        if(self.kills == KILL_TOTAL) {
            self.iio.emit('gameover')
            self.state = 'stopped';
            setTimeout(self.newGame, WAIT_TIME)
        }
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

    this.newGame = function() {
        self.kills = 0;
        self.state = 'running';

        for(var p = 0, plen = Object.keys(self.players).length; p < plen; p++) {
            var player = self.players[Object.keys(self.players)[p]];
            player.move(self.map.randomSpawn());
            player.killCount = 0;
            player.deathCount = 0;
        }
        self.iio.emit('new_game', self.data())
    }

    this.data = function() {
        return {
            id: this.id,
            players: util.packetSafe(this.players),
            items: util.packetSafe(this.items),
            score: this.kills,
            state: this.state
        }
    }

};
module.exports = Instance;