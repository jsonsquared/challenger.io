function Item(id, options) {
    var self = this;
    this.id = id;
    this.x = options.x || 0;
    this.y = options.y || 0;
    this.color = options.color || 'cyan'
    this.health = options.health || 100;
    this.indestructable = options.indestructable || true;
    this.name = options.name || 'Unnamed Item'

    // var spriteSheet = new createjs.SpriteSheet({
    //     images: [assets.item.img],
    //     frames: {width:16, height:16, regX:0, regY:0},
    //     animations: {
    //         alive:{frames:[0], frequency:5}
    //         // dying:{frames:[2,3,4,5,6,7,8,9,10,11,12,13,14], frequency:5},
    //     }
    // });

    // this.sprite = new createjs.BitmapAnimation(spriteSheet);
    // this.sprite.gotoAndPlay('alive')

    this.sprite = new createjs.Shape()
    this.sprite.graphics.beginFill(this.color).drawRect(0,0,16,16)
    stage_over.addChildAt(this.sprite, 1)

    if(me) me.collisionManager.add(this)

    this.updatePosition = function(x, y) {
        this.x = x || this.x;
        this.y = y || this.y;
        this.sprite.x = this.x;
        this.sprite.y = this.y;
    }

    this.onCollision = function() {
        socket.emit('touchItem', packetSafe(this))
    }

    this.flicker = function() {
        this.sprite
        createjs.Tween.get(this.sprite, {loop:true}).to({alpha:0},100).to({alpha:1},100)
    }

    this.remove = function() {
        stage_over.removeChild(this.sprite)
        delete items[this.id]
        delete this;
    }
}