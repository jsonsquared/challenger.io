var MIN_DAMAGE = 8;
var MAX_DAMAGE = 14;

var Player = function(id, name) {
    var self = this;
    this.TOTAL_HEALTH = 100;
    this.CLIP_SIZE = 32;

    this.reset = function(id, name) {
        console.log('reseting',id)
        self.id = id;
        self.name = name;
        self.team = 0;
        self.x = 0;
        self.y = 0;
        self.rotation = 0;

        self.lastUpdate = 0;
        self.lastHit = 0;
        self.hitBy;
        self.killCount = 0;
        self.killSpree = 0;
        self.deaths = 0;

        self.dead = false;
        self.health = this.TOTAL_HEALTH;
        self.respawning = false;

        self.clip = this.CLIP_SIZE;
    }
    this.reset(id, name)

    this.move = function(data) {
        this.x = data.x || this.x;
        this.y = data.y || this.y;
        this.rotation = data.rotation || this.rotation;
    }

    this.dash = function(data) {
        this.x = data.x || this.x;
        this.y = data.y || this.y;
    }

    this.takeDamage = function(killer) {
        var damage = Math.floor(Math.random() * (MAX_DAMAGE - MIN_DAMAGE + 1)) + MIN_DAMAGE;
        this.hitBy = killer;
        this.lastHit = damage;
        this.health -= damage;
        if(this.isDead()) {
            this.die(killer);
        }
    }

    this.die = function(killer) {
        this.deaths++;
        this.hitBy = killer;
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