function Bullet(options) {
    var self = this;
    options = options || {}
    this.x = options.x || 0;
    this.y = options.y || 0;

    this.speed = options.speed || 16;
    this.delta = 1;
    this.gun = options.gun || 0;
    this.sound = false;
    this.removed = false;
    this.trajectoryX = options.endX - options.x;
    this.trajectoryY = options.endY - options.y;
    this.length = Math.sqrt(Math.pow(this.trajectoryX,2) + (Math.pow(this.trajectoryY,2)))
    this.owner = options.owner;
    this.spawnTime = new Date();

    this.container = new createjs.Container();

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

    this.container.addChild(this.sprite)
    this.container.rotation = players[this.owner].rotation - 90
    this.container.x = options.x;
    this.container.y = options.y;

    stage.add(this,1)

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
        // this.sound = sounds.singleshot.play(range(1,2)/2)
    }

    this.flight = setInterval(function() {

        self.delta = self.speed / self.length
        var x = self.delta * self.trajectoryX
        var y = self.delta * self.trajectoryY

        // if(blocked(self.container.x, self.container.y, 2)) {
        //     self.remove();
        // } else if(hitPlayer = playerHit(self)) {
        //     if(self.owner == me.id) socket.emit('hit', {bullet: self.data(), hitPlayer: hitPlayer.data(), x: self.container.x, y:self.container.y})
        //     self.remove();
        // } else {
            self.x += x
            self.y += y
        // }
        //
        MAP_WIDTH = 1000;
        MAP_HEIGHT = 1000;
        if(self.x < 0 || self.y < 0 || self.x > MAP_WIDTH || self.y > MAP_HEIGHT) {
            self.remove();
        }

    },1000 / FPS);

    this.remove = function() {
        console.log('removing')
        this.removed = true;

        var x = this.sprite.x
        var y = this.sprite.y
        var r = this.sprite.rotation;

        if(settings.sounds) {
            delete this.sound;
        }

        stage.remove(this)

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
        stage_stage.addChildAt(this.sprite,1)

        createjs.Tween.get(this.sprite).to({alpha:0},500,createjs.Ease.quintOut).call(function() {
            stage_stage.removeChild(self.sprite)
            delete self
        })

        clearInterval(this.flight)
        delete this;
    }

    this.data = function() {
        return {startX: options.x, startY: options.y, endX: options.endX, endY: options.endY, owner: this.owner, gun:this.gun};
    }
}