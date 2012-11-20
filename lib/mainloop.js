var config = require('../config/application')
var util = require('../lib/util');
var itemsDB = require('../public/assets/itemsDB');

var initMainloop = function(instance) {

    this.spawnItem = function() {
        var point = instance.map.blankSpaces[Math.round(Math.random() * (instance.map.blankSpaces.length-1))]
        var i = util.range(0, itemsDB.length-1)
        var options = itemsDB[i]
        options.x = point.x * config.instance.tile_size
        options.y = point.y * config.instance.tile_size
        options.item = i
        var itemInstance = instance.addItem(options);

        setTimeout(function(i) {
            console.log('removing self ', i)
            instance.iio.emit('removeItem', i.id)
            delete instance.items[i.id]
        }, itemInstance.expires, itemInstance);
    }

    setInterval(this.spawnItem,5000)

}
module.exports = initMainloop;