function Bullet(options) {
    var self = this;
    options = options || {}

    this.speed = 10;
    this.delta = 1;

    this.trajectoryX = options.endX - options.x;
    this.trajectoryY = options.endY - options.y;

    this.length = Math.sqrt(Math.pow(this.trajectoryX,2) + (Math.pow(this.trajectoryY,2)))

    this.owner = options.owner;
    this.spawnTime = new Date();

    this.sprite = new createjs.Shape();
    this.sprite.graphics.beginFill('#FFF').drawEllipse(0,0,5,5);
    this.sprite.x = options.x;
    this.sprite.y = options.y;

    stage.addChild(this.sprite)

    this.spriteSheet = new createjs.SpriteSheet({
        images: [assets.bullet],
        frames: {width:8, height:16, regX:4, regY:8},
        animations: {
            alive:{frames:[0], frequency:5}
        }
    });

    this.sprite = new createjs.BitmapAnimation(this.spriteSheet);
    this.sprite.scaleX = this.sprite.scaleY = .75
    this.sprite.gotoAndPlay('alive')

    stage.addChild(this.sprite)

    $(document).bind('tick', function() {
        if(!self.removed) {
            self.delta = self.speed / self.length
            var x = self.delta * self.trajectoryX
            var y = self.delta * self.trajectoryY


            if(!blocked(self.sprite.x, self.sprite.y, 1) && !playerHit(self)) {
                self.sprite.x += x
                self.sprite.y += y

            } else {
                console.log('remove bullet sprite')
                stage.removeChild(self.sprite)
                self.removed = true;
                self.remove();
                delete self;
            }
        }
    })

    this.remove = function() {
        this.onRemove();
    }

    this.onRemove = function() {};

    this.data = function() {
        return {startX: options.x, startY: options.y, endX: options.endX, endY: options.endY, owner: this.owner};
    }
}