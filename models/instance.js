var RELOAD_TIME = 1000;
var WAIT_TIME = 5000;
var KILL_TOTAL = 20;

var config = require('../config/application');
var gameConfig = require('../config/game.config');

var Map = require('./map');
var Player = require('./player');

var Instance = function(id) {
    var self = this;
    this.id = id;
    this.players = {};
    this.iio;
    this.kills = 0;
    this.map = new Map(gameConfig.map.default);
    this.state = 'running';

    this.addPlayer = function(id, name) {
        var player = new Player(id, name);
        this.players[id] = player;
        return player;
    }

    this.removePlayer = function(id) {
        this.kills = this.kills - this.players[id].killCount;
        delete this.players[id]
    }

    this.playerList = function() {
        var playerNames = [];
        for(var p = 0, plen = Object.keys(this.players).length; p < plen; p++) {
            var player = this.players[Object.keys(this.players)[p]];
            playerNames.push(player.name)
        }
        return playerNames;
    }

    this.data = function() {
        return {
            id: this.id,
            players: this.players,
            score: this.kills,
            state: this.state
        }
    }

    this.full = function() {
        return Object.keys(this.players).length >= gameConfig.instance.player_limit
    }

    this.gameover = function() {
        return this.kills == KILL_TOTAL;
    }

    this.newGame = function() {
        self.kills = 0;
        for(var p = 0, plen = Object.keys(this.players).length; p < plen; p++) {
            var player = this.players[Object.keys(this.players)[p]];
            player.reset(player.id, player.name);
            player.setPosition(self.map.randomSpawn())
            player.respawn();
        }
    }

    this.attachPacketHandlers = function(io) {

        this.iio = io.of('/instance/' + this.id);
        this.iio.on('connection', function (socket) {

            var player = self.addPlayer(socket.id);

            socket.on('join', function(name) {

                player.name = name;
                player.setPosition(self.map.randomSpawn())

                socket.emit('instance', self.data());
                self.iio.emit('addPlayer', player);
            })

            socket.on('move', function(data) {
                var player = self.players[socket.id]
                player.move(data)

                self.iio.volatile.emit('moved', player)
            });

            socket.on('dash', function(best) {
                var player = self.players[socket.id]
                player.dash(best)

                self.iio.emit('dashed', {player:player, best:best})
            })

            socket.on('fire', function(data) {
                var shooter = self.players[data.owner];
                data.ownerClip = shooter.clip;
                if(!shooter.isEmpty()) {
                    shooter.shotFired();
                    self.iio.emit('fired', data)
                }
                if(shooter.isEmpty()) {
                    if(!shooter.reloading) {
                        self.iio.sockets[shooter.id].emit('reload', shooter)
                        shooter.reloading = true;
                        setTimeout(function() {
                            shooter.reload();
                            if(self.iio.sockets[shooter.id]) self.iio.sockets[shooter.id].emit('reloaded', shooter)
                            shooter.reloading = false;
                        }, RELOAD_TIME)
                    }
                }
            });

            socket.on('manual_reload', function(data) {
                self.iio.sockets[socket.id].emit('reload', player)
                player.reloading = true;
                setTimeout(function() {
                    player.reload();
                    socket.emit('reloaded', player)
                    player.reloading = false;
                }, RELOAD_TIME)
            })

            socket.on('hit', function(data) {
                // supposedly data.bullet hit data.hitPlayer
                // validate that at some point
                var killer = self.players[data.bullet.owner];
                var player = self.players[data.hitPlayer.id];

                if(player) {

                    if(!player.isDead()) {
                        player.takeDamage(killer.id);
                        self.iio.emit('damage', player)
                    } else {
                        self.iio.emit('died', player)
                        if(!player.respawning) {
                            player.respawning = true;
                            setTimeout(function() {

                                player.setPosition(self.map.randomSpawn())
                                player.respawn();

                                if(self.iio.sockets[player.id]) self.iio.sockets[player.id].emit('respawn', player)
                                player.respawning = false;
                            }, gameConfig.respawn_time)
                        }

                        killer.killCount++;
                        killer.killSpree++;
                        self.iio.emit('kill', {id: killer.id, killCount: killer.killCount, killee: player.id})

                        if(killer.onKillingSpree()) {
                            self.iio.emit('said', {name: 'Server', text: killer.killSpreeLevel()} )
                            self.iio.emit('spree', killer.killSpreeLevel())
                        }

                        self.kills++;
                        self.iio.emit('score', self.data())

                        if(self.gameover()) {
                            self.iio.emit('gameover')
                            self.state = 'stopped';
                            setTimeout(function() {
                                self.state = 'running';
                                self.newGame();
                                self.iio.emit('new_game', self.data())
                            }, WAIT_TIME)
                        } else {
                            if(!player.respawning) {
                                player.respawning = true;
                                setTimeout(function() {

                                    player.setPosition(self.randomSpawn())
                                    player.respawn();

                                    if(self.iio.sockets[player.id]) self.iio.sockets[player.id].emit('respawn', player)
                                    player.respawning = false;
                                }, RESPAWN_TIME)
                            }
                        }
                    }
                }
            })

            socket.on('pickup', function(data) {
                console.log('pickup', data);
            });

            socket.on('drop', function(data) {
                console.log('drop', data);
            });

            socket.on('disconnect', function(data) {
                self.removePlayer(player.id);
                self.iio.emit('removePlayer', player);
            })

            socket.on('say', function(data) {
                var player = self.players[this.id];
                var str = data.replace(/<[a-zA-Z\/][^>]*>/igm, '');
                self.iio.emit('said', {name: player.name, text: str});
            })
        })
    }
};
module.exports = Instance;