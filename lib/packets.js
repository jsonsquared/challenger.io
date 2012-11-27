var util = require('../lib/util');
var config = require('../config/application');
var map = require('../lib/mapUtils').parse()

function PacketHandler(instance) {

    var iio = app.io.of('/instance/' + instance.id);
    iio.on('connection', function (socket) {

        var player = instance.addPlayer(socket.id);
        player.linkSocket();

        socket.on('join', function(name) {
            player.join(name, instance)
        })

        socket.on('move', function(data) {
            player.move(data)
        });

        socket.on('dash', function(best) {
            player.dash(best)
        })

        socket.on('fire', function(data) {
            player.fire(data)
        });

        socket.on('manual_reload', function(data) {
            player.reloadStart();
        })

        socket.on('hit', function(data) {

            var killer = instance.players[data.bullet.owner];
            var victim = instance.players[data.hitPlayer.id];

            if(!util.touching({x:parseInt(data.x), y:parseInt(data.y)}, {x:victim.x, y:victim.y}, config.instance.tile_size)) {
                console.log('client reported a hit but server says there is no player at the reported position')
                return;
            }

            if(player && player.health > 0 && !player.dead) {
                var damage = util.range(MIN_DAMAGE, MAX_DAMAGE); //Math.floor(Math.random() * (MAX_DAMAGE - MIN_DAMAGE + 1)) + MIN_DAMAGE;
                var dead = player.hurtByPlayer(killer.id, damage);

                if(dead) {
                    killer.killedPlayer(victim)
                    instance.increaseKillCount();
                    victim.die();
                    victim.respawn();
                }
            }
        })

        socket.on('touchItem', function(data) {
            var item = instance.items[data.id] || false
            if(item && !item.used) {
                player.useItem(item);
                instance.useItem(data.id)
            }
        })

        socket.on('disconnect', function(data) {
            instance.removePlayer(player.id);
        })

        socket.on('say', function(data) {
            player.say(data)
        })
    })
    return iio
}
module.exports = PacketHandler