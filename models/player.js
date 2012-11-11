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
    this.killSpree = 0;

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
        this.killSpree = 0;
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
        this.health = this.TOTAL_HEALTH;
        this.dead = false;
    }

    this.shotFired = function() {
        this.clip--;
    }

    this.reload = function() {
        this.clip = this.CLIP_SIZE;
    }

    this.setPosition = function(obj) {
        this.x = obj.x;
        this.y = obj.y;
    }

    this.onKillingSpree = function() {
        return this.killSpree >= 2;
    }

    this.killSpreeLevel = function() {
        var str = this.name + ' got a ';
        if(this.killSpree == 2) {
            return str + 'double kill';
        } else if(this.killSpree == 3) {
            return str + 'triple kill';
        } else if(this.killSpree == 4) {
            return str + 'multi kill';
        } else if(this.killSpree == 5) {
            return str + 'ultra kill';
        } else if(this.killSpree == 6) {
            return str + 'monster kill';
        } else if(this.killSpree > 6) {
            return this.name + ' is a killing machine';
        }
    }
};
module.exports = Player;