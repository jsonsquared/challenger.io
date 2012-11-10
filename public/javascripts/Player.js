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

    // easel object
    this.container = new createjs.Container();
    this.playerContainer = new createjs.Container();
    this.dualWield = true;

    // this.gun = new createjs.Shape();
    // this.gun.graphics.f('#FFF').de(0-tileSize/2,(0-tileSize/2)-2,25,4,0);
    // this.gun.x = tileSize/2;
    // this.gun.y = tileSize/2;
    // this.playerContainer.addChild(this.gun)

    // this.circle = new createjs.Shape();
    // this.circle.graphics.f(this.color).de(0-tileSize/2,0-tileSize/2,tileSize,tileSize,0);
    // this.circle.alpha = .5
    // this.playerContainer.addChild(this.circle)

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
        self.bitmap.gotoAndPlay('alive')

        self.playerContainer.addChild(self.bitmap)
        console.log('added sprite to playerContainer')
    }


    this.nameLabel = new createjs.Text(this.name, "12px Arial", "#FFF");
    this.nameLabel.x = 0;
    this.nameLabel.y = -35;
    this.nameLabel.rotation = 0;
    this.nameLabel.lineWidth = 100;
    this.nameLabel.textAlign = 'center'
    //txt.outline = true;
    this.container.addChild(this.nameLabel);

    this.container.x = this.x;
    this.container.y = this.y;
    this.playerContainer.rotation = this.rotation

    this.container.addChild(this.playerContainer)

    this.isMe = function() {
        this.me = true;
        this.light = lightingEngine.addLight(new Light(canvas_lighting, {intensity:100, flicker:-1}))

        // this.light = lightingEngine.lights[lightingEngine.lights.push(new Light(canvas_lighting, {intensity:100, flicker:-1}))-1]
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
        socket.emit('move', {x:this.x, y:this.y, rotation:this.rotation})
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

    this.fire = function() {
        socket.emit('fire')
    }

    this.pickUp = function() {

    }

    this.putDown = function() {

    }


    this.remove = function() {
        stage.removeChild(this.container)
        delete this;
    }
}