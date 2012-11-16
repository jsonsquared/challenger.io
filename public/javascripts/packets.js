function initPacketHandler(name) {
    var name = name
    socket = io.connect('http://' + window.location.host + window.location.pathname, {reconnect: false});

    socket.on('connect', function () {
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

    socket.on('moved', function(data) {
        if(!players[data.id]) return false;
        if(data.id!=me.id) players[data.id].updatePosition(data.x, data.y, data.rotation)
    });

    socket.on('dashed', function(data) {
        if(!players[data.player.id]) return false;
        if(data.player.id!=me.id) players[data.player.id].dash('', {x:data.best.x, y:data.best.y})
    });



    socket.on('fired', function(data) {
        if(me.id != data.owner) {
            new Bullet({x:data.startX, y:data.startY, endX:data.endX, endY:data.endY, owner:data.owner})
            players[data.owner].muzzleFlash(data.gun)
        } else {
            me.updateClip(data.ownerClip)
        }
    });

    socket.on('damage', function(data) {
        if(data.id == me.id) me.updateHealth(data.health)
        if(data.hitBy == me.id) players[data.id].floatText('-' + data.lastHit)
        updateLeaderboardHP(data);
    });

    socket.on('died', function(data) {
        players[data.id].deaths = data.deaths;
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
        setTimeout(function() { new Message('Game over, new game starting in 5...') },1000)
        setTimeout(function() { new Message('Game over, new game starting in 4...') },2000)
        setTimeout(function() { new Message('Game over, new game starting in 3...') },3000)
        setTimeout(function() { new Message('Game over, new game starting in 2...') },4000)
        finalGameOverTimeout = setTimeout(function() { new Message('Game over, new game starting in 1...') },5000)
        console.log('gameover');
    });

    socket.on('new_game', function(data) {
        clearTimeout(finalGameOverTimeout)
        new Message('GO GO GO!')
        console.log('new_game', data)
    });
}