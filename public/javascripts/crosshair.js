function Crosshair() {
    this.sprite = new createjs.Bitmap(assets.crosshair.img);
    this.sprite.x = canvas_main.width/2 - TILE_SIZE
    this.sprite.y = canvas_main.height/2 - TILE_SIZE
    stage_over.addChild(this.sprite)
}