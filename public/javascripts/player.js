function Player(options) {

    var self = this;
    this.id = options.id || 0;
    this.name = options.name || 'Unnamed Player';
    this.x = options.x || 100;
    this.y = options.y || 200;
    this.health = options.health;
    this.rotation = options.rotation || 0;
    this.color = options.color || '#F00';
    this.me = options.me || false;
    this.light = {}; // blank - only used if the player is this user
    this.payload = {}
    this.killCount = options.killCount || 0;
    this.clip = options.clip;
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

    this.nameOutline = new createjs.Text(this.name.toUpperCase(), "bold 10px arial", "#000")

    this.nameOutline.outline=true;
    this.nameOutline.x = 0;
    this.nameOutline.y = -25;
    this.nameOutline.rotation = 0;
    this.nameOutline.lineWidth = 300;
    this.nameOutline.textAlign = 'center'
    this.container.addChild(this.nameOutline);
    this.nameLabel = new createjs.Text(this.name.toUpperCase(), "bold 10px arial", "#fff")
    this.nameLabel.x = 0;
    this.nameLabel.y = -25;
    this.nameLabel.rotation = 0;
    this.nameLabel.lineWidth = 300;
    this.nameLabel.textAlign = 'center'
    this.container.addChild(this.nameLabel);

    this.container.x = this.x;
    this.container.y = this.y;
    this.playerContainer.rotation = this.rotation

    this.container.addChild(this.playerContainer)

    this.floatingText = [];
    this.floatText = function(amount) {

        var self = this;
        var treatment = amount > 11 ? {color:'#F00', font: 'bold 20px arial'} : {color:'#F00', font: 'bold 12px arial'}

        var thisTextContainer = this.floatingText[this.floatingText.push(new createjs.Container())-1]

        var text = new createjs.Text(amount, treatment.font, treatment.color)
        text.lineWidth = 50;
        text.textAlign = 'center'

        var outline = new createjs.Text(amount, treatment.font, '#000')
        outline.outline = true
        outline.y = 1;
        outline.x = 1;
        outline.lineWidth = 50;
        outline.textAlign = 'center'


        thisTextContainer.addChild(outline)
        thisTextContainer.addChild(text)

        thisTextContainer.x = 0;
        thisTextContainer.y = -25;

        this.container.addChild(thisTextContainer)

        createjs.Tween.get(thisTextContainer).to({y:range(-30,-60), x:range(-20,20)},500,createjs.Ease.quintOut).to({alpha:0},200).call(function() {
            self.container.removeChild(thisTextContainer)
        })
    }

    this.isMe = function() {
        this.me = true;
        this.container.removeChild(this.nameOutline)
        this.container.removeChild(this.nameLabel)
        this.light = lightingEngine.addLight(new Light(canvas_lighting, {intensity:100, flicker:-1}))
        this.healthMeter = new ProgressBar({width:200, value:this.health, text:'HP: ' + this.health + '%'});
        this.ammoMeter = new ProgressBar({width:200, left:205, color:'#090', value:(this.clip/25)*100, text:'Ammo: ' + this.clip + ' / 25'})
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

    this.updateHealth = function(health) {
        $("#health").html(health);
        this.healthMeter.update({value:health, text: 'HP: ' + health + '%'})
    }

    this.updateClip = function(clip) {
        this.clip = clip;
        $("#clip").html(clip);
        this.ammoMeter.update({value:(this.clip/25)*100, text: 'Ammo: ' + clip + ' / 25' })
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
        if(!blocked(final.x, final.y) && !halfBlocked(final.x, final.y)) {
            this.x = final.x
            this.y = final.y;
            this.moved();
        } else if(move.x && !blocked(move.x, this.y) && !halfBlocked(move.x, this.y)) {
            this.x = move.x
            this.moved();
        } else if(move.y && !blocked(this.x, move.y) && !halfBlocked(this.x, move.y)) {
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

        this.ammoMeter.update({value:0, text:'Reloading'})
        var self = this;
        if(USE_SOUNDS) {
            setTimeout(function() {
                var sound = new Audio("/assets/sounds/reload.mp3")
                sound.play();
            },200);
        }

        this.reloadBar = new ProgressBar({value:0,text:'Reloading'});
        this.reloadBar.element.css({left:430, top:600, width:150})
        this.reloadBar.element.find('.meter').animate({width:'100%'}, 1500, function() {
            self.reloadBar.remove();
        })

        this.reloading = true;
    }

    this.reloaded = function(clip) {
        this.reloading = false;
        this.updateClip(clip)
    }

    this.respawn = function(data) {
        this.updatePosition(data.x, data.y, 0)
        this.moved()
        socket.emit('move', me.payload)
        me.updateHealth(data.health)
        // $("#health").html(data.health);

    }

    this.remove = function() {
        stage.removeChild(this.container)
        delete this;
    }

    this.data = function() {
        return {id: this.id, name: this.name};
    }
}