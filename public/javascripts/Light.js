function LightingEngine(lightingCanvas, outputCanvas, natural_light) {

    this.lightingCtx = lightingCanvas.getContext('2d');
    this.outputCtx = outputCanvas.getContext('2d');
    this.lights = [];

    this.render = function(natural_light) {

        // fill the lighting canvas with black
        this.lightingCtx.fillStyle='rgba(0,0,0,1)'
        this.lightingCtx.globalCompositeOperation = 'source-over'
        this.lightingCtx.fillRect(0,0,lightingCanvas.width,lightingCanvas.height)

        // fill the lighting canvas with the amount of "natual light"
        this.lightingCtx.fillStyle="rgba(0,0,0," + natural_light + ")";
        this.lightingCtx.globalCompositeOperation = 'destination-out'
        this.lightingCtx.fillRect(0,0,lightingCanvas.width,lightingCanvas.height)

        for(var l in this.lights) {
            this.lights[l].render();
        }

        this.outputCtx.globalCompositeOperation = 'source-over';
        this.outputCtx.drawImage(lightingCanvas, 0, 0)

    }

    // this.update(lightingCanvas, outputCanvas, natural_light)
    this.render(natural_light);
}

function Light(canvas, options) {

    this.ctx = canvas.getContext('2d')
    if(typeof options == 'undefined') options = {}
    this.intensity = options.intensity || 1;
    this.x = options.x || 0;
    this.y = options.y || 0;
    this.flicker = options.flicker || 3;

    this.render = function(x,y) {
        console.log(this.flicker)
        // draw 50 circles, each one larger than the last
        this.ctx.globalCompositeOperation = 'destination-out'
        this.ctx.fillStyle="rgba(100,100,100,.04)";
        for(var r = 1; r < this.intensity + (this.flicker ? Math.random() * this.flicker : 0); r++) {
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y ,r*1.5+10 ,0,Math.PI*2,true);
            this.ctx.closePath();
            this.ctx.fill();
        }
    }

    this.render()
    return this;
}