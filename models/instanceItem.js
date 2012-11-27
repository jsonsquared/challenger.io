var util = require('../lib/util');

function InstanceItem(options) {
    this.attributes = ['id',    'item',    'x',    'y',    'used',    'color',    'name']
    var self = this;
    self.id = options.id;
    self.item = options.item;
    self.x = options.x || 0;
    self.y = options.y || 0;
    self.used = false;
    self.color = options.color || 'yellow';
    self.expires = options.expires || 10000;
    self.duration = options.duration || 5000;
    self.name = options.name || 'Unnamed Item';
    self.instance = options.instance

    self.broadcast = function() { console.log('socket not linked')}

    self.buff = options.buff;
    self.debuff = options.debuff || function() { console.log('no debuff func') };

    self.linkSocket = function() {
        self.broadcast = function(packet, data) {
            app.io.of('/instance/' + this.instance).emit(packet, data);
        }
    }

    setTimeout(function() {
        self.broadcast('removeItem', self.id)
        delete app.instances[self.instance].items[self.id]
    }, self.expires);

    setTimeout(function() {
        self.broadcast('flickerItem', self.id)
    }, self.expires*.75, self);

    self.data = function() {
        return util.dataFor(self)
    }

    return this;
}

module.exports = InstanceItem;