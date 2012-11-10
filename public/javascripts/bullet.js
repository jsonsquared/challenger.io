function Bullet(options) {
    var self = this;
    options = options || {}

    this.speed = 20;
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
    console.log(this.length)

    $(document).bind('tick', function() {
        self.delta = self.speed / self.length
        var x = self.delta * self.trajectoryX
        var y = self.delta * self.trajectoryY
        self.sprite.x += x
        self.sprite.y += y
    })

}