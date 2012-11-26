var leaderboard = [];
function updateLeaderboard() {
    leaderboard = [];
    for(var i = 0, len = Object.keys(players).length; i < len; i++) {
        leaderboard.push(players[Object.keys(players)[i]]);
    }

    $("#leaderboard table tbody").html('');

    leaderboard = leaderboard.sort(function(a, b) { return b.killCount - a.killCount});

    for(var i = 0, len = leaderboard.length; i < len; i++) {
        var player = leaderboard[i];
        $("#leaderboard table tbody").append('<tr><td>'+parseInt(i + 1, 10)+'.</td><td>'+ player.name +'</td><td>'+ (player.killCount || 0) +'</td><td>'+ (player.deathCount || 0 )+'</td></tr><tr><td class="leaderboard-hp" colspan="4"><div id="'+player.id+'" style="width: '+player.health+'%" class="page-header leaderboard-hp"></div></td></tr>')
    }

    document.title = '(' + Object.keys(players).length +') ' + instance
}

function updateLeaderboardHP(player) {
    $('#' + player.id).stop().animate({width: player.health + '%'});
}