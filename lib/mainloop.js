var config = require('../config/application')
var util = require('../lib/util');
var itemsDB = require('../public/assets/itemsDB');

function Mainloop(instance) {
    var self = this;

    // this.spawnItem = function() {
    //     var point = instance.map.blankSpaces[Math.round(Math.random() * (instance.map.blankSpaces.length-1))]
    //     var i = util.range(0, itemsDB.length-1)
    //     var options = itemsDB[i]
    //     options.x = point.x * config.instance.tile_size
    //     options.y = point.y * config.instance.tile_size
    //     options.item = i
    //     instance.addItem(options);
    // }
    //
    // setInterval(this.spawnItem, config.instance.ITEM_FREQUENCY)

    return this;
}

module.exports = Mainloop