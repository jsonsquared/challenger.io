function Bullet(options) {
    options = options || {}

    this.speed = .02;
    this.delta = 1;

    this.startX = options.x;
    this.startY = options.y;

    this.x = this.startX;
    this.y = this.startY;

    this.trajectoryX = options.endX - this.startX;
    this.trajectoryY = options.endY - this.startY;

    this.owner = 0;
    this.spawnTime = new Date();

    this.sprite = new createjs.Shape();
    this.sprite.graphics.beginFill('#FFF').drawEllipse(0,0,5,5);
    this.sprite.x = this.x;
    this.sprite.y = this.y;

    stage.addChild(this.sprite)

    var self = this;
    $(document).bind('tick', function() {
        self.x += (self.trajectoryX * self.speed * self.delta)
        self.y += (self.trajectoryY * self.speed * self.delta)
        self.sprite.x = self.x
        self.sprite.y = self.y
    })

}