var util = require('../lib/util');
var config = require('../config/application');

var initPacketHandler = function(instance) {
    var iio = app.io.of('/instance/' + instance.id);
    iio.on('connection', function (socket) {

        var player = instance.addPlayer(socket.id);

        socket.on('join', function(name) {

            player.name = name;
            player.instance = instance.id;
            player.setPosition(instance.randomSpawn())

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

            if(player) {

                if(!player.isDead()) {
                    player.takeDamage(killer.id);

                    clearInterval(player.regenInterval); // stop gaining health
                    clearTimeout(player.regenTimeout) // reset the time we wait to start regenerating health
                    player.regenTimeout = setTimeout(function(p) {
                        p.regenInterval = setInterval(function(p) {
                            p.health+=REGEN_AMOUNT
                            if(p.health>=100) {
                                p.health = 100;
                                clearInterval(p.regenInterval)
                                clearTimeout(p.regenTimeout)
                            }
                            iio.emit('regen', p.data())
                        },REGEN_INTERVAL, p)
                    }, REGEN_WAIT, player)

                    iio.emit('damage', player.data())

                    if(player.health<=0) {
                        player.die();
                        iio.emit('died', player.data())

                        killer.killCount++;
                        killer.killSpree++;
                        iio.emit('kill', {id: killer.id, killCount: killer.killCount, killee: player.id})

                        if(killer.onKillingSpree()) {
                            iio.emit('said', {name: 'Server', text: killer.killSpreeLevel()} )
                            iio.emit('spree', killer.killSpreeLevel())
                        }

                        instance.kills++;
                        iio.emit('score', instance.data())

                        if(instance.gameover()) {
                            iio.emit('gameover')
                            instance.state = 'stopped';
                            setTimeout(function() {
                                instance.state = 'running';
                                instance.newGame();
                                iio.emit('new_game', instance.data())
                            }, WAIT_TIME)
                        } else {
                            if(!player.respawning) {
                                player.respawning = true;
                                setTimeout(function() {

                                    player.setPosition(instance.randomSpawn())
                                    player.respawn();

                                    if(iio.sockets[player.id]) iio.sockets[player.id].emit('respawn', player.data())
                                    player.respawning = false;
                                }, RESPAWN_TIME)
                            }
                        }
                    }
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