var util = require('../lib/util');
var map = require('../lib/mapUtils').parse()
var config = require('../config/application')

var Player = function(id, name) {

    this.attributes = ["id","name","team","x","y","rotation","moveDistance","lastHit","hitBy","killCount","killSpree","deathCount","dead","health","respawning","clip"]

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

    self.emit = self.broadcast = self.volatile = function() { }

    this.linkSocket = function() {
        this.emit = function(packet, data) {
            var socket = app.io.of('/instance/' + this.instance).sockets[this.id]
            if(socket) socket.emit(packet, data)
        }
        this.broadcast = function(packet, data) {
            app.io.of('/instance/' + this.instance).emit(packet, data);
        }
        this.volatile = function(packet, data) {
            app.io.of('/instance/' + this.instance).volatile.emit(packet, data);
        }
    }

    this.join = function(name, instance) {
        self.name = name;
        self.instance = instance.id;
        self.move(map.randomSpawn())
        self.emit('instance', instance.data());
        self.broadcast('addPlayer', self.data());
    }

    this.move = function(data) {
        self.x = data.x || self.x;
        self.y = data.y || self.y;
        self.rotation = data.rotation || self.rotation;
        self.volatile('moved', self.data())
    }

    this.dash = function(data) {
        self.x = data.x || self.x;
        self.y = data.y || self.y;
        self.emit('dashed', {player:self.data(), best:data})
    }

    this.useItem = function(item) {
        if(self.currentItem) self.currentItem.debuff(self)
        item.buff(self)
        self.emit('adjustAttributes', self.data())
        self.currentItem = item;
        setTimeout(function(item) {
            item.debuff(self)
            self.emit('adjustAttributes', self.data())
        },item.duration, item);

    }

    this.takeDamage = function(damage, type, what, callback) {
        // todo: assign killer if its a TYPE_KILLER
        self.health -= damage
        self.emit('damage', self.data());

        if(self.health<=0) {
            self.health = 0;
            return true
        } else {
            self.regenHealth()
            return false;
        }
    }

    this.regenHealth = function() {
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
                self.emit('regen', self.health)
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

    this.killedPlayer = function(killed) {
        this.killCount++;
        this.killSpree++;
        self.broadcast('kill', {id: self.id, killCount: self.killCount, killee: killed})
        if(self.onKillingSpree()) {
            self.broadcast('said', {name: 'Server', text: self.killSpreeLevel()} )
            self.broadcast('spree', self.killSpreeLevel())
        }
    }

    this.die = function(killer) {
        clearInterval(self.regenInterval); // stop gaining health
        clearTimeout(self.regenTimeout)
        self.deathCount++;
        self.hitBy = killer;
        self.killSpree = 0;
        self.health = 0;
        self.dead = true;
        self.x = -10000;
        self.y = -10000;
        self.broadcast('died', self.data())
    }

    this.isEmpty = function() {
        return self.clip <= 0;
    }

    this.respawn = function(timeout) {
        clearTimeout(this.respawning)
        self.respawning = setTimeout(function() {
            self.move(map.randomSpawn());
            self.health = config.instance.TOTAL_HEALTH;
            self.emit('respawn', self.data());
            self.respawning = false;
            self.dead = false;
        }, timeout || config.instance.RESPAWN_TIME)
    }

    this.fire = function(bullet) {
        if(self.isEmpty()) {
            self.reloadStart();
            return false;
        } else {
            self.clip--
            self.broadcast('fired', {bullet:bullet, ammo:self.clip})
            return true
        }
    }

    this.reloadStart = function() {
        if(self.reloading || self.isEmpty()) return false;

        self.emit('reload', self.data())
        self.reloading = true;
        setTimeout(self.reloadComplete, config.instance.RELOAD_TIME)
        return true;
    }

    this.reloadComplete = function() {
        if(!self) return
        self.clip = self.clipSize;
        self.emit('reloaded', self.data())
        self.reloading = false;
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

    this.say = function(what) {
        self.broadcast('said', {name: self.name, text: what.replace(/<[a-zA-Z\/][^>]*>/igm, '')});
    }

    this.data = function() {
        return util.dataFor(this)
    }
}
module.exports = Player;