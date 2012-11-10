function Player(options) {

    this.name = options.name || 'Unnamed Player';
    this.x = options.x || 0;
    this.y = options.y || 0;
    this.color = options.color || '#F00';

    this.sprite = new createjs.Container();
    this.circle = new createjs.Shape();
    this.circle.graphics.f(this.color).de(0-tileSize/2,0-tileSize/2,tileSize,tileSize,0);
    this.sprite.addChild(this.circle);

    this.light = lightingEngine.lights[lightingEngine.lights.push(new Light(canvas_lighting, {intensity:100}))-1]

    stage.addChild(this.sprite)

    this.updatePosition = function(x,y) {
        this.sprite.x = this.light.x = x || this.x;
        this.sprite.y = this.light.y = y || this.y;
    }

    this.moveUp = function() {
        if(!blocked(this.x-tileSize*.5, this.y - moveDistance - tileSize*1.5,1)) {
            this.y-=moveDistance;
        }
    }

    this.moveDown = function() {
        if(!blocked(this.x, this.y + moveDistance + tileSize*.5,0)) {
            this.y+=moveDistance;
        }
    }

    this.moveLeft = function() {
        if(!blocked(this.x - moveDistance - tileSize * 1.5, this.y-tileSize*.5,1)) {
            this.x-=moveDistance;
        }
    }

    this.moveRight = function() {
        if(!blocked(this.x + moveDistance + tileSize*.5, this.y,0)) {
            this.x+=moveDistance;
        }
    }

    this.fire = function() {

    }

    this.pickUp = function() {

    }

    this.putDown = function() {

    }

}