ProgressBar = function(options) {

    var self = this;

    var markup = [
        "<div id='progressbar' class='progressbar'>",
        "    <div class='container'></div>",
        "    <div class='meter'></div>",
        "    <div class='label'></div>",
        "</div>"
    ].join('')

    this.element = $(markup).appendTo('#container')
    this.element.css({width:options.width || 100, top:0, left:0})
    this.element.find('.meter').css({width: (options.value || 0) + '%'})
    this.element.find('.label').text(options.text)

    this.remove = function() {
        this.element.fadeOut(500,function() {
            $(this).remove();
            delete self
        })
    }

}