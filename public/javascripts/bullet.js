function Bullet(options) {
    var self = this;
    options = options || {}

    this.speed = 10;
    this.delta = 1;

    this.trajectoryX = options.endX - options.x;
    this.trajectoryY = options.endY - options.y;

    this.length = Math.sqrt(Math.pow(this.trajectoryX,2) + (Math.pow(this.trajectoryY,2)))

    this.owner = options.owner;
    this.spawnTime = new Date();

    this.sprite = new createjs.Shape();
    this.sprite.graphics.beginFill('#FFF').drawEllipse(0,0,5,5);
    this.sprite.x = options.x;
    this.sprite.y = options.y;

    stage.addChild(this.sprite)
    this.removed = false;

    $(document).bind('tick', function() {
        if(!self.removed) {
            self.delta = self.speed / self.length
            var x = self.delta * self.trajectoryX
            var y = self.delta * self.trajectoryY


            if(blocked(self.sprite.x, self.sprite.y, 1)) {
                // hit a wall
                self.remove();
            } else if(hitPlayer = playerHit(self)) {
                // hit a player
                if(self.owner == me.id) socket.emit('hit', {bullet: self.data(), hitPlayer: hitPlayer.data()})
                self.remove();
            } else {
                self.sprite.x += x
                self.sprite.y += y
            }
        }
    })

    this.remove = function() {
        stage.removeChild(this.sprite)
        this.removed = true;
        console.log('remove bullet sprite')
        this.onRemove();
        delete this;
    }

    this.onRemove = function() {};

    this.data = function() {
        return {startX: options.x, startY: options.y, endX: options.endX, endY: options.endY, owner: this.owner};
    }
}