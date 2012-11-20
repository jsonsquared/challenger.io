var util = require('../lib/util');
var config = require('../config/application');
var map = require('../lib/mapUtils').parse()
var initPacketHandler = function(instance) {
    var iio = app.io.of('/instance/' + instance.id);
    iio.on('connection', function (socket) {

        var player = instance.addPlayer(socket.id);

        socket.on('join', function(name) {

            player.name = name;
            player.instance = instance.id;
            player.setPosition(map.randomSpawn())

            socket.emit('instance', instance.data());
            iio.emit('addPlayer', player.data());
        })

        socket.on('move', function(data) {
            var player = instance.players[socket.id]
            player.move(data)

            iio.volatile.emit('moved', player.data())
        });

        socket.on('dash', function(best) {
            var player = instance.players[socket.id]
            player.dash(best)

            iio.emit('dashed', {player:player.data(), best:best})
        })

        socket.on('fire', function(data) {
            var shooter = instance.players[data.owner];
            data.ownerClip = shooter.clip;
            if(!shooter.isEmpty()) {
                shooter.shotFired();
                iio.emit('fired', data)
            }
            if(shooter.isEmpty()) {
                if(!shooter.reloading) {
                    iio.sockets[shooter.id].emit('reload', shooter.data())
                    shooter.reloading = true;
                    setTimeout(function() {
                        shooter.reload();
                        if(iio.sockets[shooter.id]) iio.sockets[shooter.id].emit('reloaded', shooter.data())
                        shooter.reloading = false;
                    }, RELOAD_TIME)
                }
            }
        });

        socket.on('manual_reload', function(data) {
            iio.sockets[socket.id].emit('reload', player.data())
            player.reloading = true;
            setTimeout(function() {
                player.reload();
                socket.emit('reloaded', player.data())
                player.reloading = false;
            }, RELOAD_TIME)
        })

        socket.on('hit', function(data) {

            var killer = instance.players[data.bullet.owner];
            var player = instance.players[data.hitPlayer.id];

            if(!util.touching({x:parseInt(data.x), y:parseInt(data.y)}, {x:player.x, y:player.y}, config.instance.tile_size)) {
                console.log('client reported a hit but server says there is no player at the reported position')
                return;
            }

            if(player && !player.isDead()) {
                var damage = Math.floor(Math.random() * (MAX_DAMAGE - MIN_DAMAGE + 1)) + MIN_DAMAGE;

                player.hurtByPlayer(killer.id, damage);
                if(player.isDead()) {
                    killer.killedPlayer(player)
                    instance.increaseKillCount()
                }
            }
        })

        socket.on('touchItem', function(data) {
            var player = instance.players[socket.id];
            var item = instance.items[data.id] || false
            if(item && !item.used) {
                player.useItem(item);
                instance.useItem(data.id)
            }
        })

        socket.on('disconnect', function(data) {
            instance.removePlayer(player.id);
            iio.emit('removePlayer', player.data());
        })

        socket.on('say', function(data) {
            var player = instance.players[this.id];
            var str = data.replace(/<[a-zA-Z\/][^>]*>/igm, '');
            iio.emit('said', {name: player.name, text: str});
        })
    })
    return iio
}
module.exports = initPacketHandler