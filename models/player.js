var Player = function(id, name) {
    this.TOTAL_HEALTH = 25;

    this.id = id;
    this.name = name;
    this.team = 0;
    this.x = 0;
    this.y = 0;
    this.rotation = 0;

    this.lastUpdate = 0;

    this.dead = false;
    this.health = this.TOTAL_HEALTH;
    this.respawning = false;

    this.move = function(data) {
        this.x = data.x || this.x;
        this.y = data.y || this.y;
        this.rotation = data.rotation || this.rotation;
    }

    this.takeDamage = function() {
        this.health -= 6;
        if(this.isDead()) {
            this.die();
        }
    }

    this.die = function() {
        this.dead = true;
        this.x = -10000;
        this.y = -10000;
    }

    this.isDead = function() {
        return this.health < 0 || this.dead;
    }

    this.respawn = function(io) {
        // if(this.respawnTimer) return;
        // this.respawnTimer = setTimeout(function() {
            // this.respawnTimer = null;
            this.health = this.TOTAL_HEALTH;
            this.dead = false;
            // io.emit('respawn');
        // }, 3000);
    }
};
module.exports = Player;