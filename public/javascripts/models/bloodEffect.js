function BloodEffect() {

    this.sprite = new createjs.Bitmap(assets.bloodborder.img);
    stage_over.addChild(this.sprite)
    this.sprite.alpha = 0;

    this.update = function(amount) {
        createjs.Tween.removeTweens(this.sprite)
        createjs.Tween.get(this.sprite).to({alpha:amount},400)
    }

}