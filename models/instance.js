var Player = require('./player');

var Instance = function(id, options) {
    this.id = id;
    this.players = {};
    this.iio;
    this.kills = 0;

    this.addPlayer = function(id, name) {
        var player = new Player(id, name);
        this.players[id] = player;
        return player;
    }

    this.removePlayer = function(id) {
        delete this.players[id]
    }

    this.data = function() {
        return {id: this.id, players: this.players, score: this.kills}
    }

    this.attachPacketHandlers = function(io) {
        var self = this;
        this.iio = io.of('/instance/' + this.id);
        this.iio.on('connection', function (socket) {

            var player = self.addPlayer(socket.id);

            socket.on('join', function(name) {
                player.name = name;
                socket.emit('instance', self.data());
                self.iio.emit('addPlayer', player);
            })

            socket.on('move', function(data) {
                var player = self.players[socket.id]
                player.move(data)

                self.iio.volatile.emit('moved', player)
            });

            socket.on('fire', function(data) {
                self.iio.emit('fired', data)
            });

            socket.on('hit', function(data) {
                console.log('hit', data);
                // supposedly data.bullet hit data.hitPlayer
                // validate that at some point
                var player = self.players[data.hitPlayer.id];

                player.takeDamage();
                self.iio.emit('damage', player)

                if(player.isDead()) {
                    self.iio.emit('died', player)
                    if(!player.respawning) {
                        player.respawning = true;
                        setTimeout(function() {
                            player.respawn();
                            self.iio.sockets[player.id].emit('respawn', player)
                            player.respawning = false;
                        }, 3000)
                    }

                    self.kills++;
                    self.iio.emit('score', self.data())
                }
            })

            socket.on('pickup', function(data) {
                console.log('pickup', data);
                //
            });

            socket.on('drop', function(data) {
                console.log('drop', data);
            });

            socket.on('disconnect', function(data) {
                console.log('disconnect', player)
                self.removePlayer(player.id);
                self.iio.emit('removePlayer', player);
            })
        })
    }
};
module.exports = Instance;