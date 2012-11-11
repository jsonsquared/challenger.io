var Player = function(id, name) {
    this.TOTAL_HEALTH = 100;
    this.CLIP_SIZE = 25;

    this.id = id;
    this.name = name;
    this.team = 0;
    this.x = 0;
    this.y = 0;
    this.rotation = 0;

    this.lastUpdate = 0;
    this.killedBy;
    this.killCount = 0;

    this.dead = false;
    this.health = this.TOTAL_HEALTH;
    this.respawning = false;

    this.clip = this.CLIP_SIZE;

    this.move = function(data) {
        this.x = data.x || this.x;
        this.y = data.y || this.y;
        this.rotation = data.rotation || this.rotation;
    }

    this.takeDamage = function(killer) {
        this.health -= 14;
        if(this.isDead()) {
            this.die(killer);
        }
    }

    this.die = function(killer) {
        this.killedBy = killer;
        this.health = 0;
        this.dead = true;
        this.x = -10000;
        this.y = -10000;
    }

    this.isDead = function() {
        return this.health < 0 || this.dead;
    }

    this.isEmpty = function() {
        return this.clip <= 0;
    }

    this.respawn = function(x, y) {
        this.x = x;
        this.y = y;
        this.health = this.TOTAL_HEALTH;
        this.dead = false;
    }

    this.shotFired = function() {
        this.clip--;
    }

    this.reload = function() {
        this.clip = this.CLIP_SIZE;
    }
};
module.exports = Player;