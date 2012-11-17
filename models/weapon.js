var Weapon = function(name, damage, clipsize, options) {
    this.name = name;
    this.damage = damage;
    this.clipsize = clipsize;
    this.clip = clipsize;

    this.options = options || {};
    this.firerate = this.options.firerate || 1;
    this.vary = false;
    this.variation = this.options.variation || 1;
    this.reloadTime = this.options.reloadTime || 1500;

    this.fire = function() {
        if(!this.isEmpty()) {
            this.clip -= this.firerate;
            return this.damage();
        }
        return -1;
    }

    this.isEmpty = function() {
        return this.clip <= 0;
    }

    this.reload = function(cb) {
        var self = this;
        setTimeout(function() {
            self.clip = self.clipsize;
            cb();
        }, this.reloadTime);
    }

    this.damage = function() {
        if(this.vary) {
            var max = this.damage + this.damage * this.variation;
            var min = this.damage - this.damage * this.variation;
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
        return damage;
    }
}
module.exports = Weapon;