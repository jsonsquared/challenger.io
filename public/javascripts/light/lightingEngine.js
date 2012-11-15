function LightingEngine(lightingCanvas, outputCanvas) {

    this.lightingCtx = lightingCanvas.getContext('2d');
    this.outputCtx = outputCanvas.getContext('2d');
    this.lights = [];

    this.render = function() {

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

    this.render();
}
