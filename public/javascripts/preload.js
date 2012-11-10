function preload(files, callback) {
    this.loaded = 0;
    this.needed = Object.keys(files).length
    var self = this;
    for(var i in files) {
        var path = files[i];
        files[i] = {img: new Image(), path:path}
        files[i].img.src = path;
        files[i].img.onload = function() {
            self.loaded++
            if(self.loaded == self.needed) callback();
        }
    }
}