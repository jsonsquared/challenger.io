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
    this.deaths = options.deaths || 0;
    this.clip = options.clip;
    this.reloading = false;
    this.dashing = false;
    this.recoil = 0;

    // easel object
    this.container = new createjs.Container();
    this.playerContainer = new createjs.Container();
    this.dualWield = true;

    this.img = new Image();
    this.img.src = '/assets/images/fed.png'
    this.img.onload = function() {
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
        this.light = {}
        this.light = lightingEngine.addLight(new Light(canvas_lighting, {intensity:100, flicker:5}))

        this.healthMeter = new ProgressBar({width:200, value:this.health, text:'HP: ' + this.health + '%'});
        this.ammoMeter = new ProgressBar({width:200, color:'#090', value:(this.clip/25)*100, text:'Ammo: ' + this.clip + ' / 32'})
    }

    stage.addChildAt(this.container,1)

    this.updatePosition = function(x, y, rotation) {
        this.x = x || this.x;
        this.y = y || this.y;
        this.rotation = rotation || this.rotation
        this.playerContainer.rotation = this.rotation
        this.container.x = this.light.x = this.x;
        this.container.y = this.light.y = this.y;
        if (this==me) raycaster.position = new illuminated.Vec2(this.container.x+1,this.container.y+1);
    }

    this.updateHealth = function(health) {
        $("#health").html(health);
        this.healthMeter.update({value:health, text: 'HP: ' + health + '%'})
    }

    this.updateClip = function(clip) {
        this.clip = clip;
        $("#clip").html(clip);
        this.ammoMeter.update({value:(this.clip/25)*100, text: 'Ammo: ' + clip + ' / 32' })
    }

    this.updateCounts = function() {
        $('#kills span').html(this.killCount);
        $('#deaths span').html(this.deaths);
    }

    this.moved = function() {
        var deltaX = crosshair.sprite.x - me.container.x
        var deltaY = crosshair.sprite.y - me.container.y

        me.rotation = Math.atan2(deltaY, deltaX) / Math.PI * 180;
        this.payload = {x:this.x, y:this.y, rotation:this.rotation}
    }

    this.dash = function(dir) {
        console.log(dir)
        var move = final = latest = {x:this.x,y:this.y}

        for(var t = 0; t < 20; t++) {
            if(dir == 'U') {move.y = me.y-MOVE_DISTANCE}
            if(dir == 'D') {move.y = me.y+MOVE_DISTANCE}
            if(dir == 'L') {move.x = me.x-MOVE_DISTANCE}
            if(dir == 'R') {move.x = me.x+MOVE_DISTANCE}
            var latest = latest || this.move(move, true)
        }
        move = final = {x:this.x,y:this.y}
        console.log(latest)

        if(dir == 'U') {move.y = latest.y-MOVE_DISTANCE*20}
        if(dir == 'D') {move.y = latest.y+MOVE_DISTANCE*20}
        if(dir == 'L') {move.x = latest.x-MOVE_DISTANCE*20}
        if(dir == 'R') {move.x = latest.x+MOVE_DISTANCE*20}
        if(!blocked(move.x, move.y) && !halfBlocked(move.x, move.y)) {
            final.x = move.x
            final.y = move.y;
        } else if(move.x && !blocked(move.x, this.y) && !halfBlocked(move.x, this.y)) {
            final.x = move.x
        } else if(move.y && !blocked(this.x, move.y) && !halfBlocked(this.x, move.y)) {
            final.y = move.y;
        }

        createjs.Tween.removeTweens(this)
        console.log(final)
        createjs.Tween.get(this).to(final,500,createjs.Ease.sineOut).call(function() {
            self.x = final.x;
            self.y = final.y;
            me.dashing = false;
            clearInterval(this.dashFiring)
            self.moved()
        });


    }

    this.move = function(move, justCheck) {
        if(me.dashing) return false
        var move = {x:move.x || this.x, y:move.y||this.y}
        var final = {}

        if(!blocked(move.x, move.y) && !halfBlocked(move.x, move.y)) {
            final.x = move.x
            final.y = move.y;

        } else if(move.x && !blocked(move.x, this.y) && !halfBlocked(move.x, this.y)) {
            final.x = move.x
            final.y = this.y

        } else if(move.y && !blocked(this.x, move.y) && !halfBlocked(this.x, move.y)) {
            final.y = move.y;
            final.x = this.x
        }

        if(arguments.length==1) {
            self.x = final.x;
            self.y = final.y;
            self.moved()
        } else {
            return final == move ? false : final
        }

        // createjs.Tween.removeTweens(this)
        // createjs.Tween.get(this).to(final,60,createjs.Ease.sineOut).call(function() {
        //     self.x = final.x;
        //     self.y = final.y;
        //     self.moved()
        //     if(typeof callback == 'function') callback()
        // });
    }

    this.fire = function(e) {

        if(this.reloading) return false;

        var gun = range(0,1);
        var recoilFactor = gun == 0 ? -2: 2
        recoilFactor = recoilFactor < 0 ? recoilFactor - this.recoil : recoilFactor + this.recoil
        recoilFactor = this.dashing ? 0 : recoilFactor

        var b = new Bullet({
            speed:this.dashing ? 100 : undefined,
            x:me.x,
            y:me.y,
            endX: e.offsetX + range(recoilFactor*-1, recoilFactor),
            endY: e.offsetY + range(recoilFactor*-1, recoilFactor),
            owner:me.id,
            gun:gun
        })
        socket.emit('fire', b.data());

        b.onRemove = function() {
            garbage.push(b);
        };

        this.muzzleFlash(gun)
    }

    this.muzzleFlash = function(gun) {
        var flash = new createjs.BitmapAnimation(spriteSheets.muzzle);
        flash.gotoAndPlay('fire')

        flash.scaleX = flash.scaleY = range(.5,1)
        flash.x = 20 * flash.scaleX
        flash.y = (gun == 1 ? -16 : 1) * flash.scaleY
        flash.alpha=.5

        this.playerContainer.addChild(flash)


        createjs.Tween.get(flash).to({alpha:0},1000,createjs.Ease.quintOut).call(function() {
            self.playerContainer.removeChild(this)
        });

    }

    this.pickUp = function() {

    }

    this.putDown = function() {

    }

    this.touching = function(otherObject) {
        if (this.y + TILE_SIZE< otherObject.sprite.y) return false;
        if (this.y > otherObject.sprite.y + TILE_SIZE) return false;
        if (this.x + TILE_SIZE < otherObject.sprite.x) return false;
        if (this.x > otherObject.sprite.x + TILE_SIZE) return false;
        return true;
    }

    this.reload = function() {

        this.ammoMeter.update({value:0, text:'Reloading'})
        var self = this;
        if(use_sounds) {
            setTimeout(function() {
                var sound = new Audio("/assets/sounds/reload.mp3")
                sound.play();
            },200);
        }

        try { self.reloadBar.remove();} catch(err) { }

        this.reloadBar = new ProgressBar({value:0,text:'Reloading', parentElement:'#game'});
        this.reloadBar.element.css({left:430, top:600, width:150})
        foo = this.reloadBar.element
        this.reloadBar.element.find('.pbmeter').animate({width:'100%'}, 1500, function() {
            self.reloadBar.remove();
        })

        this.reloading = true;
    }

    this.reloaded = function(clip) {
        this.recoil = 0;
        this.reloading = false;
        this.updateClip(clip)
    }

    this.respawn = function(data) {
        this.updatePosition(data.x, data.y, 0)
        this.moved()
        socket.emit('move', me.payload)
        me.updateHealth(data.health)

    }

    this.remove = function() {
        stage.removeChild(this.container)
        delete this;
    }

    this.data = function() {
        return {id: this.id, name: this.name};
    }
}