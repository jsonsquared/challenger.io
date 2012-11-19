function Item(options, socket) {
    var self = this;
    this.x = options.x || 0;
    this.y = options.y || 0;
    this.health = options.health || 100;
    this.expires = options.expires || 10000
    this.indestructable = options.indestructable || true;
    this.name = options.name || 'Unnamed Item'
    this.expiring = setTimeout(function(i) {
        console.log('removing self ', i)
        socket.emit('removeItem', i.id)
        delete i
    }, this.expires, this)
}

module.exports = Item;