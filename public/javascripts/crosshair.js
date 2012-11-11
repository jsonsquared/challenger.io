function Crosshair() {
    this.x = 0;
    this.y = 0;
    this.spriteSheet = new createjs.SpriteSheet({
        images: [assets.crosshair.img],
        frames: {width:32, height:32, regX:8, regY:8},
        animations: {
            main:{frames:[0], frequency:5}
        }
    });

    this.sprite = new createjs.BitmapAnimation(this.spriteSheet);
    this.sprite.gotoAndPlay('main')

    stage.addChild(this.sprite)
}