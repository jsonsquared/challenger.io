var Player = function(id, name) {
    this.id = id;
    this.name = name;
    this.team = 0;
    this.x = 0;
    this.y = 0;
    this.rotation = 0;

    this.lastUpdate = 0;

    this.dead = false;
    this.health = 25;

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
    }

    this.isDead = function() {
        return this.health < 0 || this.dead;
    }

};
module.exports = Player;