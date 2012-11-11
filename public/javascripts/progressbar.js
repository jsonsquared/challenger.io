ProgressBar = function(options) {
    var options = options || {}

    var self = this;
    this.value = options.value || 0
    this.width = options.width || 100

    var markup = [
        "<div id='progressbar' class='progressbar'>",
        "    <div class='container'></div>",
        "    <div class='meter'></div>",
        "    <div class='label'></div>",
        "</div>"
    ].join('')

    this.element = $(markup).appendTo('#container')
    this.element.css({width:options.width, top:0, left:0})
    this.element.find('.meter').css({width: options.value + '%'})
    this.element.find('.label').text(options.text)

    this.remove = function() {
        this.element.fadeOut(500,function() {
            $(this).remove();
            delete self
        })
    }

    this.update = function(options) {
        options = options || this

        this.element.find('.meter').stop().animate({width: options.value + '%'})
        this.element.find('.label').text(options.text)
    }

}