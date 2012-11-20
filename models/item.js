function Item(options) {
    var self = this;
    this.item = options.item;
    this.x = options.x || 0;
    this.y = options.y || 0;
    this.color = options.color || 'yellow'
    this.expires = 10000
    this.name = options.name || 'Unnamed Item'
    this.buff = options.buff
    this.debuff = options.debuff

    return this;
}

module.exports = Item;