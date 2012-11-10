function Player(options) {

    this.id = options.id || 0;
    this.name = options.name || 'Unnamed Player';
    this.x = options.x || 100;
    this.y = options.y || 200;
    this.rotation = options.rotation || 0;
    this.color = options.color || '#F00';
    this.me = options.me || false;

    this.shape = new createjs.Container();

    this.gun = new createjs.Shape();
    this.gun.graphics.f('#FFF').de(0-tileSize/2,(0-tileSize/2)-2,25,4,0);
    this.gun.x = tileSize/2;
    this.gun.y = tileSize/2;
    this.shape.addChild(this.gun)

    this.circle = new createjs.Shape();
    this.circle.graphics.f(this.color).de(0-tileSize/2,0-tileSize/2,tileSize,tileSize,0);
    this.shape.addChild(this.circle)

    this.shape.x = this.x;
    this.shape.y = this.y;
    this.shape.rotation = this.rotation

    this.light = {};

    // if(this.me) {
    //     this.light = lightingEngine.lights[lightingEngine.lights.push(new Light(canvas_lighting, {intensity:100, flicker:-1}))-1]
    // } else {
    //     this.light = {}
    // }

    this.isMe = function() {
        this.me = true;
        this.light = lightingEngine.lights[lightingEngine.lights.push(new Light(canvas_lighting, {intensity:100, flicker:-1}))-1]
    }

    stage.addChild(this.shape)

    this.updatePosition = function(x, y, rotation) {
        this.shape.rotation = rotation || this.rotation
        this.shape.x = this.light.x = x || this.x;
        this.shape.y = this.light.y = y || this.y;
    }

    this.moved = function() {
        socket.emit('move', {x:this.x, y:this.y, rotation:this.rotation})
    }

    this.moveUp = function() {
        if(!blocked(this.x-tileSize*.5, this.y - moveDistance - tileSize*1.5,1)) {
            this.y-=moveDistance;
            this.moved()
        }
    }

    this.moveDown = function() {
        if(!blocked(this.x, this.y + moveDistance + tileSize*.5,0)) {
            this.y+=moveDistance;
            this.moved()
        }
    }

    this.moveLeft = function() {
        if(!blocked(this.x - moveDistance - tileSize * 1.5, this.y-tileSize*.5,1)) {
            this.x-=moveDistance;
            this.moved()
        }
    }

    this.moveRight = function() {
        if(!blocked(this.x + moveDistance + tileSize*.5, this.y,0)) {
            this.x+=moveDistance;
            this.moved()
        }
    }

    this.fire = function() {
        socket.emit('fire')
    }

    this.pickUp = function() {

    }

    this.putDown = function() {

    }

}