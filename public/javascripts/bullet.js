function Bullet(options) {
    var self = this;
    options = options || {}

    this.speed = options.speed || 16;
    this.delta = 1;
    this.gun = options.gun || 0;
    this.sound = false;

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

    stage_under.addChildAt(this.sprite,1)
    this.removed = false;


    var playerHit = function(bullet) {
        for(var i = 0, len = Object.keys(players).length; i < len; i++) {
            var key = Object.keys(players)[i];
            if(bullet.owner != key && bullet.removed == false) {
                var player = players[key];
                if(player.touching(bullet)) return player;
            }
        }
        return false;
    }

    if(settings.sounds) {
        this.sound = sounds.singleshot.play(range(1,2)/2)
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
                if(self.owner == me.id) socket.emit('hit', {bullet: self.data(), hitPlayer: hitPlayer.data(), x: self.sprite.x, y:self.sprite.y})
                HIT = {bullet: self.data(), hitPlayer: hitPlayer.data(), x: self.sprite.x, y:self.sprite.y};
               self.remove();
            } else {
                self.sprite.x += x
                self.sprite.y += y
            }

            if(self.sprite.x < TILE_SIZE || self.sprite.y < TILE_SIZE || self.sprite.x > canvas_main.width - TILE_SIZE || self.sprite.y > canvas_main.height - TILE_SIZE) {
                self.remove();
            }

        }
    });

    this.remove = function() {
        var x = this.sprite.x
        var y = this.sprite.y
        var r = this.sprite.rotation;

        if(settings.sounds) {
            delete this.sound;
        }

        stage_under.removeChild(this.sprite)
        this.removed = true;

        var spriteSheet = new createjs.SpriteSheet({
            images: [assets.ricochet.img],
            frames: {width:16, height:16, regX:8, regY:8},
            animations: {
                richochet:{frames:[0], frequency:5}
            }
        });

        this.sprite = new createjs.BitmapAnimation(spriteSheet);
        this.sprite.gotoAndPlay('richochet')
        this.sprite.x = x;
        this.sprite.y = y;
        this.sprite.rotation = r - 90 + 30
        stage_under.addChildAt(this.sprite,1)

        createjs.Tween.get(this.sprite).to({alpha:0},500,createjs.Ease.quintOut).call(function() {
            stage_under.removeChild(self.sprite)
            delete self
        })
    }

    this.data = function() {
        return {startX: options.x, startY: options.y, endX: options.endX, endY: options.endY, owner: this.owner, gun:this.gun};
    }
}