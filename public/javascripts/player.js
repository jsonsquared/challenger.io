function Player(options) {

    var self = this;
    this.id = options.id || 0;
    this.name = options.name || 'Unnamed Player';
    this.x = options.x || 100;
    this.y = options.y || 200;
    this.rotation = options.rotation || 0;
    this.color = options.color || '#F00';
    this.me = options.me || false;
    this.light = {}; // blank - only used if the player is this user
    this.payload = {}

    this.reloading = false;

    // easel object
    this.container = new createjs.Container();
    this.playerContainer = new createjs.Container();
    this.dualWield = true;

    this.img = new Image();
    this.img.src = '/assets/images/fed.png'
    this.img.onload = function() {
        console.log('loaded')
        var img = this
        self.spriteSheet = new createjs.SpriteSheet({
            images: [img],
            frames: {width:32, height:32, regX:16, regY:16},
            animations: {
                alive:{frames:[0], frequency:5}
                // dying:{frames:[2,3,4,5,6,7,8,9,10,11,12,13,14], frequency:5},
            }
        });

        self.bitmap = new createjs.BitmapAnimation(self.spriteSheet);
        self.bitmap.rotation = 270
        self.bitmap.scaleX = self.bitmap.scaleY = .75
        self.bitmap.gotoAndPlay('alive')

        self.playerContainer.addChild(self.bitmap)
        console.log('added sprite to playerContainer')
    }

    this.nameOutline = new createjs.Text(this.name.toUpperCase(), "bold 12px arial", "#000")

    this.nameOutline.outline=true;
    this.nameOutline.x = 0;
    this.nameOutline.y = -34;
    this.nameOutline.rotation = 0;
    this.nameOutline.lineWidth = 300;
    this.nameOutline.textAlign = 'center'
    this.container.addChild(this.nameOutline);
    this.nameLabel = new createjs.Text(this.name.toUpperCase(), "bold 12px arial", "#fff")
    this.nameLabel.x = 0;
    this.nameLabel.y = -35;
    this.nameLabel.rotation = 0;
    this.nameLabel.lineWidth = 300;
    this.nameLabel.textAlign = 'center'
    this.container.addChild(this.nameLabel);

    this.container.x = this.x;
    this.container.y = this.y;
    this.playerContainer.rotation = this.rotation

    this.container.addChild(this.playerContainer)

    this.isMe = function() {
        this.me = true;
        this.container.removeChild(this.nameOutline)
        this.container.removeChild(this.nameLabel)
        this.light = lightingEngine.addLight(new Light(canvas_lighting, {intensity:100, flicker:-1}))
    }

    stage.addChild(this.container)

    this.updatePosition = function(x, y, rotation) {
        this.x = x || this.x;
        this.y = y || this.y;
        this.rotation = rotation || this.rotation
        this.playerContainer.rotation = this.rotation
        this.container.x = this.light.x = this.x;
        this.container.y = this.light.y = this.y;
    }

    this.moved = function() {
        var deltaX = crosshair.sprite.x - me.container.x
        var deltaY = crosshair.sprite.y - me.container.y

        me.rotation = Math.atan2(deltaY, deltaX) / Math.PI * 180;
        this.payload = {x:this.x, y:this.y, rotation:this.rotation}
    }

    this.move = function(move) {
        var final = {
            x:move.x || this.x,
            y:move.y || this.y
        };
        if(!blocked(final.x, final.y)) {
            this.x = final.x
            this.y = final.y;
            this.moved();
        } else if(move.x && !blocked(move.x, this.y)) {
            this.x = move.x
            this.moved();
        } else if(move.y && !blocked(this.x, move.y)) {
            this.y = move.y;
            this.moved();
        }
    }

    this.fire = function(e) {

        if(this.reloading) return false;

        var b = new Bullet({
            x:me.x,
            y:me.y,
            endX: e.offsetX + (Math.random()*8)-2,
            endY: e.offsetY+ (Math.random()*8)-2,
            owner:me.id
        })
        socket.emit('fire', b.data());

        b.onRemove = function() {
            garbage.push(b);
        };

    }

    this.pickUp = function() {

    }

    this.putDown = function() {

    }

    this.touching = function(otherObject) {
        if (this.y + tileSize - 1 < otherObject.sprite.y + 1) return false;
        if (this.y + 1 > otherObject.sprite.y + tileSize - 1) return false;
        if (this.x + tileSize - 1 < otherObject.sprite.x + 1) return false;
        if (this.x + 1 > otherObject.sprite.x + tileSize - 1) return false;
        return true;
    }

    this.reload = function() {
        if(USE_SOUNDS) {
        setTimeout(function() {
            var sound = new Audio("/assets/sounds/reload.mp3")
            sound.play();
            },200);
        }
        this.reloading = true;
    }

    this.respawn = function(data) {
        this.updatePosition(data.x, data.y, 0)
        this.moved()
        socket.emit('move', me.payload)
        $("#health").html(data.health);

    }

    this.remove = function() {
        stage.removeChild(this.container)
        delete this;
    }

    this.data = function() {
        return {id: this.id, name: this.name};
    }
}