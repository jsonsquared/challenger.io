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

    this.addLight = function(light) {
        this.lights.push(light)
        this.lights[this.lights.length-1].id = this.lights.length-1
        return this.lights[this.lights.length-1]
    }

    this.removeLight = function(light) {
        delete this.lights[light.id]
    }

    // this.update(lightingCanvas, outputCanvas, natural_light)
    this.render(natural_light);
}
