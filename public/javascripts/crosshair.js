function Crosshair() {
    var self = this;

    this.sprite = new createjs.Container();

    this.normal = new createjs.Bitmap(assets.crosshair.img)
    this.normal.sourceRect =new createjs.Rectangle(0,0,32,32)

    this.strike = new createjs.Bitmap(assets.crosshair.img)
    this.strike.sourceRect = new createjs.Rectangle(32,0,32,32)

    this.strike.alpha = 0

    this.hit = function() {
        self.strike.alpha = 1;
        self.normal.alpha = 0
        createjs.Tween.get(self.strike).to({alpha:0},400)
        createjs.Tween.get(self.normal).to({alpha:1},400)
    }

    this.sprite.addChild(this.normal)
    this.sprite.addChild(this.strike)

    this.sprite.x = canvas_main.width/2 - TILE_SIZE
    this.sprite.y = canvas_main.height/2 - TILE_SIZE

    stage_over.addChild(this.sprite)
}