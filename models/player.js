var util = require('../lib/util');
var map = require('../lib/mapUtils').parse()
var config = require('../config/application')

var Player = function(id, name) {

    var self = this;

    self.regenInterval = 0;
    self.regenTimeout = 0;
    self.id = id;
    self.name = name;
    self.team = 0;
    self.x = 0;
    self.y = 0;
    self.rotation = 0;
    self.moveDistance = config.instance.MOVE_DISTANCE
    self.lastUpdate = 0;
    self.lastHit = 0;
    self.hitBy;
    self.killCount = 0;
    self.killSpree = 0;
    self.deathCount = 0;
    self.currentItem = false;
    self.dead = false;
    self.health = config.instance.TOTAL_HEALTH;
    self.respawning = false;
    self.clip = self.clipSize = config.instance.CLIP_SIZE;

    this.move = function(data) {
        this.x = data.x || this.x;
        this.y = data.y || this.y;
        this.rotation = data.rotation || this.rotation;
    }

    this.dash = function(data) {
        this.x = data.x || this.x;
        this.y = data.y || this.y;
    }

    this.useItem = function(item) {
        this.currentItem = item;
    }

    this.takeDamage = function(damage, type, what, callback) {
        // todo: assign killer if its a TYPE_KILLER
        this.health -= damage

        if(this.health<=0) {
            this.health = 0;
            return true
        } else {
            return false;
        }
    }

    this.regenHealth = function(step) {
        clearInterval(self.regenInterval); // stop gaining health
        clearTimeout(self.regenTimeout) // reset the time we wait to start regenerating health

        self.regenTimeout = setTimeout(function() {
            self.regenInterval = setInterval(function() {
                self.health+=config.instance.REGEN_AMOUNT
                if(self.health>=100) {
                    self.health = 100;
                    clearInterval(self.regenInterval)
                    clearTimeout(self.regenTimeout)
                }
                if(typeof step == 'function') step(self.health)
            },config.instance.REGEN_INTERVAL)
        }, config.instance.REGEN_WAIT)
    }

    this.hurtByPlayer = function(killer, damage) {
        // todo: allow players to manage their own damage
        // player X may have a more powerful weapon

        this.hitBy = killer;
        this.lastHit = damage;
        return this.takeDamage(damage, config.instance.TYPE_PLAYER, killer)
    }

    this.hurtByItem = function(item, damage) {
        // todo: give items a min/max damage
        return this.takeDamage(damage, config.instance.TYPE_ITEM, item)
    }

    this.killedPlayer = function(callback) {
        this.killCount++;
        this.killSpree++;
    }

    this.die = function(killer) {
        clearInterval(this.regenInterval); // stop gaining health
        clearTimeout(this.regenTimeout)
        this.deathCount++;
        this.hitBy = killer;
        this.killSpree = 0;
        this.health = 0;
        this.dead = true;
        this.x = -10000;
        this.y = -10000;
    }

    this.isEmpty = function() {
        return this.clip <= 0;
    }

    this.respawn = function(callback) {
        this.health = config.instance.TOTAL_HEALTH;
        this.dead = false;
        console.log('respawning soon')
        clearTimeout(this.respawning)
        this.respawning = setTimeout(function() {
            self.setPosition(map.randomSpawn())
            self.respawning = false;
            console.log('respawned!')
            if(typeof callback == 'function') callback()

        }, config.instance.RESPAWN_TIME)
    }

    this.shotFired = function() {
        this.clip--;
    }

    this.reload = function() {
        this.clip = this.clipSize;
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

    this.data = function() {
        return util.packetSafe(this)
    }
}
module.exports = Player;