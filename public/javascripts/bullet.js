function Bullet(options) {
    var self = this;
    options = options || {}

    this.size = 8;
    this.speed = 2;
    this.delta = 1;

    this.trajectoryX = options.endX - options.x;
    this.trajectoryY = options.endY - options.y;

    this.length = Math.sqrt(Math.pow(this.trajectoryX,2) + (Math.pow(this.trajectoryY,2)))

    this.owner = 0;
    this.spawnTime = new Date();

    this.sprite = new createjs.Shape();
    this.sprite.graphics.beginFill('#FFF').drawEllipse(0,0,5,5);
    this.sprite.x = options.x;
    this.sprite.y = options.y;

    stage.addChild(this.sprite)

    $(document).bind('tick', function() {
        if(!self.removed) {
            self.delta = self.speed / self.length
            var x = self.delta * self.trajectoryX
            var y = self.delta * self.trajectoryY


            if(!blocked(self.sprite.x, self.sprite.y, 1) && !playerHit(self)) {
                self.sprite.x += x
                self.sprite.y += y
            } else {
                stage.removeChild(self.sprite)
                self.removed = true;
                self.remove();
                delete self;
            }
        }
    })

    this.remove = function() {
        this.onRemove();
    }

    this.onRemove = function() {};

    this.data = function() {
        return {startX: options.y, startY: options.x, endX: options.endX, endY: options.endY};
    }
}