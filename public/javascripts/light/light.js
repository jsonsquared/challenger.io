function Light(canvas, options) {

    this.ctx = canvas.getContext('2d')
    if(typeof options == 'undefined') options = {}
    this.intensity = options.intensity || 1;
    this.x = options.x || 0;
    this.y = options.y || 0;
    this.flicker = options.flicker || 3;
    this.strength = options.strength || .05

    this.render = function(x,y) {

        // draw 50 circles, each one larger than the last
        this.ctx.globalCompositeOperation = 'destination-out'
        this.ctx.fillStyle="rgba(100,100,100," + this.strength + ")";
        for(var r = 1; r < this.intensity + (this.flicker ? Math.random() * this.flicker : 0); r+=2) {
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y ,r*2 ,0,Math.PI*2,true);
            this.ctx.closePath();
            this.ctx.fill();
        }
    }

    this.render()
    return this;
}