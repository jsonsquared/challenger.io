function Bullet(options) {
    var self = this;
    options = options || {}

    this.speed = 16;
    this.delta = 1;

    this.trajectoryX = options.endX - options.x;
    this.trajectoryY = options.endY - options.y;

    this.length = Math.sqrt(Math.pow(this.trajectoryX,2) + (Math.pow(this.trajectoryY,2)))

    this.owner = options.owner;
    this.spawnTime = new Date();

    this.spriteSheet = new createjs.SpriteSheet({
        images: [assets.bullet.img],
        frames: {width:8, height:16, regX:4, regY:16},
        animations: {
            alive:{frames:[0], frequency:5}
        }
    });

    this.sprite = new createjs.BitmapAnimation(this.spriteSheet);
    this.sprite.scaleX = this.sprite.scaleY = .75
    this.sprite.gotoAndPlay('alive')

    this.sprite.rotation = players[this.owner].rotation - 90
    this.sprite.x = options.x;
    this.sprite.y = options.y;

    stage.addChildAt(this.sprite,2)
    this.removed = false;

    if(USE_SOUNDS) {
        this.sound = new Audio("/assets/sounds/single.mp3");
        this.sound.volume =( Math.random()/2 + .5);
        this.sound.play();
    }

    $(document).bind('tick', function() {
        if(!self.removed) {
            self.delta = self.speed / self.length
            var x = self.delta * self.trajectoryX
            var y = self.delta * self.trajectoryY

            if(blocked(self.sprite.x, self.sprite.y, 2)) {
                // hit a wall
               self.remove();
            } else if(hitPlayer = playerHit(self)) {
                // hit a player
                if(self.owner == me.id) socket.emit('hit', {bullet: self.data(), hitPlayer: hitPlayer.data()})
               self.remove();
            } else {
                self.sprite.x += x
                self.sprite.y += y
            }

            if(self.sprite.x < tileSize || self.sprite.y < tileSize || self.sprite.x > canvas_main.width - tileSize || self.sprite.y > canvas_main.height - tileSize) {
                self.remove();
            }

        }
    });

    this.remove = function() {
        if(USE_SOUNDS) {
            this.sound.pause();
            delete this.sound;
        }
        stage.removeChild(this.sprite)
        this.removed = true;
        this.onRemove();
        delete this;
    }

    this.onRemove = function() {};

    this.data = function() {
        return {startX: options.x, startY: options.y, endX: options.endX, endY: options.endY, owner: this.owner};
    }
}