var util = require('../lib/util');
var map = require('../lib/mapUtils').parse()

var Player = function(id, name) {
    var self = this;

    this.regenInterval = 0;
    this.regenTimeout = 0;

    this.reset = function(id, name) {
        console.log('reseting',id)
        self.id = id;
        self.name = name;
        self.team = 0;
        self.x = 0;
        self.y = 0;
        self.rotation = 0;
        self.moveDistance = MOVE_DISTANCE

        self.lastUpdate = 0;
        self.lastHit = 0;
        self.hitBy;
        self.killCount = 0;
        self.killSpree = 0;
        self.deaths = 0;

        self.dead = false;
        self.health = TOTAL_HEALTH;
        self.respawning = false;

        self.clip = self.clipSize = CLIP_SIZE;
    }
    this.reset(id, name)

    this.emit = function(name, packet) {
        app.io.of('/instance/' + this.instance).sockets[this.id].emit(name, packet);
    }

    this.broadcast = function(name, packet) {
        app.io.of('/instance/' + this.instance).emit(name, packet)
    }

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
        if(this.currentItem) {
            this.currentItem.debuff(this)
        }
        this.currentItem = item;
        this.currentItem.buff(this)
        setTimeout(function(item, player) {
            item.debuff(player)
        },item.duration, item, this);

    }
    this.buff = function(data) {
        this.emit('adjustAttributes', this.data())
    }

    this.debuff = function(data) {
        this.emit('adjustAttributes', this.data())
    }

    this.takeDamage = function(damage, type, what) {
        // todo: assign killer if its a TYPE_KILLER
        this.health -= damage

        if(this.health<=0) {
            this.die()
        } else {

            this.emit('damage', this.data())
            clearInterval(self.regenInterval); // stop gaining health
            clearTimeout(self.regenTimeout) // reset the time we wait to start regenerating health

            self.regenTimeout = setTimeout(function() {
                self.regenInterval = setInterval(function() {
                    self.health+=REGEN_AMOUNT
                    if(self.health>=100) {
                        self.health = 100;
                        clearInterval(self.regenInterval)
                        clearTimeout(self.regenTimeout)
                    }
                    self.emit('regen', self.health)
                },REGEN_INTERVAL)
            }, REGEN_WAIT)
        }
    }

    this.hurtByPlayer = function(killer, damage) {
        // todo: allow players to manage their own damage
        // player X may have a more powerful weapon

        this.hitBy = killer;
        this.lastHit = damage;
        this.takeDamage(damage, TYPE_PLAYER, killer)
    }

    this.hurtByItem = function(item, damage) {
        // todo: give items a min/max damage
        this.takeDamage(damage, TYPE_ITEM, item)
    }

    this.killedPlayer = function(player) {
        this.killCount++;
        this.killSpree++;
        this.broadcast('kill', {id: this.id, killCount: this.killCount, killee: player.id})
        if(this.onKillingSpree()) {
            this.emit('said', {name: 'Server', text: this.killSpreeLevel()} )
            this.emit('spree', this.killSpreeLevel())
        }
    }
    this.die = function(killer) {
        clearInterval(this.regenInterval); // stop gaining health
        clearTimeout(this.regenTimeout)
        this.deaths++;
        this.hitBy = killer;
        this.killSpree = 0;
        this.health = 0;
        this.dead = true;
        this.x = -10000;
        this.y = -10000;
        this.broadcast('died', this.data())

        if(!this.respawning) {
            this.respawning = setTimeout(function() {

                self.setPosition(map.randomSpawn())
                self.respawn();

                self.emit('respawn', self.data())
                self.respawning = false;
            }, RESPAWN_TIME)
        }
    }

    this.isDead = function() {
        return this.health < 0 || this.dead;
    }

    this.isEmpty = function() {
        return this.clip <= 0;
    }

    this.respawn = function(x, y) {
        this.health = TOTAL_HEALTH;
        this.dead = false;
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