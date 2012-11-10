var Player = require('./player');

var Instance = function(id, options) {
    this.id = id;
    this.players = {};
    this.iio;

    this.addPlayer = function(id, name) {
        var player = new Player(id, name);
        this.players[id] = player;
        return player;
    }

    this.removePlayer = function(id) {
        delete this.players[id]
    }

    this.data = function() {
        return {id: this.id, players: this.players}
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
                console.log('fire', data);
                self.iio.emit('fired', data)
                //player.fire
                //send bulletdata
                //send repercussions
                //send start/end of line, if/what you hit
            });

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