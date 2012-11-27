function Item(options) {
    var self = this;
    this.id = options.id;
    this.color = options.color || 'yellow';
    this.expires = options.expires || 10000;
    this.duration = options.duration || 5000;
    this.name = options.name || 'Unnamed Item';
    this.buff = options.buff;
    this.debuff = options.debuff || function() { console.log('no debuff func') };

    return this;
}

module.exports = Item;