function startGame(instance) {
    // if players is not empty, we must be restarting
    if(Object.keys(players).length!==0) {
        for(var p in players) {
            players[p].remove();
        }
        players = {};
        items = [];
        $('#meter-ammo, #meter-hp').remove();
    }

    $("#total_score h2 span").html(instance.score)
    console.log('startGame')
    for(var p in instance.players) {
        players[instance.players[p].id] = new Player(instance.players[p])
    }

    updateLeaderboard()
    // bloodEffect.update(0)
    for(var p in players) {
        if(players[p].id == socket.socket.sessionid) {
            players[p].isMe();
            me = players[p]
        }
        updateLeaderboardHP(p)
    }

    console.log(instance)
    for(var i in instance.items) {

        items[i] = new Item(i, instance.items[i])
    }

    $(document).trigger('startGame')
}