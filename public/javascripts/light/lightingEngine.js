function LightingEngine(lightingCanvas, outputCanvas) {

    this.lightingCtx = lightingCanvas.getContext('2d');
    this.outputCtx = outputCanvas.getContext('2d');
    this.lights = [];

    this.render = function() {
        canvas_lighting_ctx.fillRect(0, 0, canvas_lighting.width, canvas_lighting.height);

        for(var l in this.lights) {
            this.lights[l].render();
        }

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
