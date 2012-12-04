function Bullet(options) {
    var self = this;
    options = options || {}

    this.gun = options.gun || 0;
    this.sound = false;
    this.removed = false;
    this.owner = options.owner;

    var geometry = new THREE.CubeGeometry( 2, 10, 2 );
    // var texture = THREE.ImageUtils.loadTexture( '/assets/images/fed.png' );
    var material = Physijs.createMaterial(new THREE.MeshLambertMaterial(),.6,.5 );

    this.sprite = new Physijs.BoxMesh( geometry, material,.9)
    this.sprite.position.z = 11
    this.sprite.position.x = options.x;
    this.sprite.position.y = options.y*-1;
    this.sprite.rotation.z = me.container.rotation.z

    scene.add(this.sprite)

    this.sprite.addEventListener( 'collision', function() {
        // console.log(this)
        // console.log(arguments)
    });

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

    var trajectoryX = options.endX - options.x;
    var trajectoryY = options.endY - options.y;
    var length = Math.sqrt(Math.pow(trajectoryX,2) + (Math.pow(trajectoryY,2)))
    var speed = options.speed || 20;
    var delta = speed / length
    var tx = mouseX - 1024/2
    var ty = mouseY - 704/2

    scene.addEventListener('update',function() {
        self.sprite.applyCentralImpulse(new THREE.Vector3(delta * tx * speed, delta * ty * speed * -1, 0));
    })

    this.remove = function() {
        var x = this.sprite.x
        var y = this.sprite.y
        var r = this.sprite.rotation;

        if(settings.sounds) {
            delete this.sound;
        }

        scene.remove(this.sprite)
        // stage_under.removeChild(this.sprite)
        this.removed = true;

        // var spriteSheet = new createjs.SpriteSheet({
        //     images: [assets.ricochet.img],
        //     frames: {width:16, height:16, regX:8, regY:8},
        //     animations: {
        //         richochet:{frames:[0], frequency:5}
        //     }
        // });
        //
        // this.sprite = new createjs.BitmapAnimation(spriteSheet);
        // this.sprite.gotoAndPlay('richochet')
        // this.sprite.x = x;
        // this.sprite.y = y;
        // this.sprite.rotation = r - 90 + 30
        // stage_under.addChildAt(this.sprite,1)
        //
        // createjs.Tween.get(this.sprite).to({alpha:0},500,createjs.Ease.quintOut).call(function() {
        //     stage_under.removeChild(self.sprite)
        //     delete self
        // })
    }

    this.data = function() {
        return {startX: options.x, startY: options.y, endX: options.endX, endY: options.endY, owner: this.owner, gun:this.gun};
    }
}