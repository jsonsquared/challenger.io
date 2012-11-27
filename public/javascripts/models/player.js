function Player(options) {

    var self = this;
    this.dashing = false;
    this.stamina = 100;
    this.moveDistance = MOVE_DISTANCE
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
    this.deathCount = options.deathCount || 0;
    this.clip = this.clipSize = options.clip;
    this.reloading = false;
    this.recoil = 0;
    this.singleClickFiring = false;

    // easel object
    this.container = new createjs.Container();
    this.playerContainer = new createjs.Container();
    this.dualWield = true;

    self.spriteSheet = new createjs.SpriteSheet({
        images: [assets.fed.img],
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
        stage_over.addChild(this.container)
        stage_under.removeChild(this.container)
        this.light = {}
        // this.light = lightingEngine.addLight(new Light(canvas_lighting, {intensity:40, flicker:0, strength:.1}))
        myLight.position = new illuminated.Vec2(this.x,this.y);

        this.healthMeter = new ProgressBar({id:'meter-hp', width:200, value:this.health, text:'HP: ' + this.health + '%'});
        this.ammoMeter = new ProgressBar({id:'meter-ammo', width:200, value:(this.clip/25)*100, text:'Ammo: ' + this.clip + ' / 32'})
        this.collisionManager = new CollisionManager(this, TILE_SIZE);
    }

    stage_under.addChildAt(this.container,1)

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
        bloodEffect.update((100 - health) / 50)
        this.healthMeter.update({value:health, text: 'HP: ' + health + '%'})
    }

    this.updateClip = function(clip) {
        this.clip = clip;
        $("#clip").html(clip);
        this.ammoMeter.update({value:(this.clip/25)*100, text: 'Ammo: ' + clip + ' / ' + me.clipSize })
    }

    this.updateCounts = function() {
        $('#kills span').html(this.killCount);
        $('#deaths span').html(this.deathCount);
    }

    this.moved = function(skipmyLight) {
        var deltaX = crosshair.sprite.x - me.container.x
        var deltaY = crosshair.sprite.y - me.container.y

        me.rotation = Math.atan2(deltaY, deltaX) / Math.PI * 180;
        this.payload = {x:this.x, y:this.y, rotation:this.rotation}

        if (this==me) {

            if(arguments.length==0) {
                if(INPUT_L() || INPUT_R()) myLight.position.x = INPUT_L() ? this.x+1 : this.x-1
                if(INPUT_U() || INPUT_D()) myLight.position.y = INPUT_U() ? this.y+1 : this.y-1
            }

            me.updatePosition(this.x, this.y, this.rotation)
            me.collisionManager.check();
        }
    }

    this.dash = function(dir, best) {

        if(this == me && this.stamina < STAMINA_TO_DASH || this.dashing) return
        this.dashing = true
        this.stamina -= STAMINA_TO_DASH

        if(typeof best == 'undefined') {
            var best = {x:this.x, y:this.y}
            if(dir == 'U') {
                for(var d=this.y; d > this.y - self.moveDistance*SLIDE_FACTOR; d-=self.moveDistance) {
                    var x = this.x; var y = d;
                    if(!blocked(x, y) && !halfBlocked(x, y)) { best.y = d } else { break }
                }
            }
            if(dir == 'D') {
                for(var d=this.y; d < this.y + self.moveDistance*SLIDE_FACTOR; d+=self.moveDistance) {
                    var x = this.x; var y = d;
                    if(!blocked(x, y) && !halfBlocked(x, y)) { best.y = d } else { break }
                }
            }
            if(dir == 'L') {
                for(var d=this.x; d > this.x - self.moveDistance*SLIDE_FACTOR; d-=self.moveDistance) {
                    var y = this.y; var x = d;
                    if(!blocked(x, y) && !halfBlocked(x, y)) { best.x = d } else { break }
                }
            }
            if(dir == 'R') {
                for(var d=this.x; d < this.x + self.moveDistance*SLIDE_FACTOR; d+=self.moveDistance) {
                    var y = this.y; var x = d;
                    if(!blocked(x, y) && !halfBlocked(x, y)) { best.x = d } else { break }
                }
            }
            socket.emit('dash', best)
        }

        createjs.Tween.get(this).to(best,500,createjs.Ease.sineOut).call(function() {
            self.x = best.x;
            self.y = best.y;
            self.dashing = false;
            self.moved(true)
        });

        if(this==me) createjs.Tween.get(myLight.position).to(best,500,createjs.Ease.sineOut)

    }

    this.move = function(move) {
        var was = {x:this.x, y:this.y}
        var final = {
             x:move.x || this.x,
             y:move.y || this.y
         };
         if(!blocked(final.x, final.y,2) && !halfBlocked(final.x, final.y,2)) {
             this.x = final.x
             this.y = final.y;
             this.moved();
         } else if(move.x && !blocked(move.x, this.y,2) && !halfBlocked(move.x, this.y,2)) {
             this.x = move.x
             this.moved();
         } else if(move.y && !blocked(this.x, move.y,2) && !halfBlocked(this.x, move.y,2)) {
             this.y = move.y;
             this.moved();
         }

    }

    this.fire = function(e) {

        if(this.reloading) return false;

        var gun = range(0,1);
        var recoilFactor = gun == 0 ? -2: 2
        recoilFactor = recoilFactor < 0 ? recoilFactor - this.recoil : recoilFactor + this.recoil
        recoilFactor = this.dashing ? 0 : recoilFactor

        var b = new Bullet({
            x:gun==1 ? me.x -8 : me.x+8,
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
        if(settings.sounds) {
            setTimeout(function() {
                var sound = new Audio("/assets/sounds/reload.mp3")
                sound.play();
            },200);
        }

        try { self.reloadBar.remove();} catch(err) { }

        this.reloadBar = new ProgressBar({value:0,text:'', parentElement:'#game', color:'red'});
        this.reloadBar.element.css({width:40, height:5,opacity:.5})
        foo = this.reloadBar.element
        this.reloadBar.element.find('.pbmeter').animate({width:'100%'}, {
            duration:900,
            easing:'linear',
            complete:function() {
                self.reloadBar.remove();
            },
            step:function() {
                self.reloadBar.element.css({
                    left:crosshair.sprite.x,
                    top:crosshair.sprite.y + 70
                })
            }
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
        myLight.position.x = data.x
        myLight.position.y = data.y
        socket.emit('move', me.payload)
        me.updateHealth(data.health)

    }

    this.remove = function() {
        if(this == me) {
            stage_over.removeChild(this.container)
        } else {
            stage_under.removeChild(this.container)
        }
        delete players[this];
        delete this;
    }

    this.data = function() {
        return {id: this.id, name: this.name};
    }
}