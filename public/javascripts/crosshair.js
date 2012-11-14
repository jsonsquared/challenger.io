function Crosshair() {
    this.spriteSheet = new createjs.SpriteSheet({
        images: [assets.crosshair.img],
        frames: {width:32, height:32, regX:8, regY:8},
        animations: {
            main:{frames:[0], frequency:5}
        }
    });

    this.sprite = new createjs.BitmapAnimation(this.spriteSheet);
    this.sprite.x = canvas_main.width/2 - tileSize
    this.sprite.y = canvas_main.height/2 - tileSize

    this.sprite.gotoAndPlay('main')

    crosshair_stage.addChild(this.sprite)
}