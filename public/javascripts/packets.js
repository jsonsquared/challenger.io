function initPacketHandler(name) {
    var name = name
    socket = io.connect('http://' + window.location.host + window.location.pathname, {reconnect: false});

    socket.on('connect', function () {
        $(document).trigger('connected')
        connected = true
        socket.emit('join', name)
        $('#me').text(name)
    });

    socket.on('instance', function(data) {
        join(data)
        new Message('GO GO GO!')
        updateLeaderboard();
    });

    socket.on('addPlayer', function(data) {
        if(data.id!= socket.socket.sessionid) players[data.id] = new Player(data)
        updateLeaderboard();
    });

    socket.on('removePlayer', function(data) {
        if(!players[data.id]) return false
        players[data.id].remove()
        delete players[data.id]
        updateLeaderboard();
    })

    socket.on('addItem', function(data) {
        items[data.id] = new Item(data.id, data)
    })

    socket.on('flickerItem', function(data) {
        if(items[data]) items[data].flicker();
    })

    socket.on('removeItem', function(data) {
        if(items[data]) items[data].remove();
    })

    socket.on('moved', function(data) {
        if(!players[data.id]) return false;
        if(data.id!=me.id) players[data.id].updatePosition(data.x, data.y, data.rotation)
    });

    socket.on('dashed', function(data) {
        if(!players[data.player.id]) return false;
        if(data.player.id!=me.id) players[data.player.id].dash('', {x:data.best.x, y:data.best.y})
    });

    socket.on('fired', function(data) {
        if(me.id != data.bullet.owner) {
            new Bullet({x:data.bullet.startX, y:data.bullet.startY, endX:data.bullet.endX, endY:data.bullet.endY, owner:data.bullet.owner})
            players[data.bullet.owner].muzzleFlash(data.bullet.gun)
        } else {
            me.updateClip(data.ammo, me.clipSize)
        }
    });

    socket.on('damage', function(data) {
        if(data.id == me.id) me.updateHealth(data.health)
        if(data.hitBy == me.id) {
            players[data.id].floatText('-' + data.lastHit)
            crosshair.hit()
        }
        updateLeaderboardHP(data);
    });

    socket.on('adjustAttributes', function(data) {
        for(var a in data) {
            me[a] = data[a]
        }
        me.updateClip(data.clip)
        me.updateHealth(data.health)
    })

    socket.on('died', function(data) {
        players[data.id].deathCount = data.deathCount;
        players[data.id].updatePosition(data.x, data.y, data.rotation)
        me.updateCounts();
    });

    socket.on('kill', function(data) {
        players[data.id].killCount = data.killCount;
        if(data.id == me.id) new Message('You killed ' + players[data.killee].name)
        updateLeaderboard();
        me.updateCounts();
    })

    socket.on('score', function(data) {
        $("#total_score h2 span").html(data.score)
    });

    socket.on('respawn', function(data) {
        me.respawn(data);
    });

    socket.on('regen', function(data) {
        me.updateHealth(data)
    });

    socket.on('said', function(data) {
        $('#chat ul').append('<li><strong>' + data.name + '</strong>: ' + data.text + '</li>')
        $('#chat li:not(:last)').each(function() {
            $(this).css({bottom:'+=' + $('#chat li:last').height() + 'px'})
        })

        if($('#chat li').length>10) $('#chat li:first').remove()

    });

    socket.on('reload', function(data) {
        me.reload();
    });

    socket.on('reloaded', function(data) {
        me.reloaded(data.clip);
    });

    socket.on('gameover', function() {
        setTimeout(function() { new Message('Round over') },1000)
        setTimeout(function() { new Message('New round starting in 5...') },1000)
        setTimeout(function() { new Message('New round starting in 4...') },2000)
        setTimeout(function() { new Message('New round starting in 3...') },3000)
        setTimeout(function() { new Message('New round starting in 2...') },4000)
        finalGameOverTimeout = setTimeout(function() { new Message('New round starting in 1...') },5000)
    });

    socket.on('new_game', function(data) {
        clearTimeout(finalGameOverTimeout)
        startGame(data)
        new Message('GO GO GO!')
    });

    return this;
}