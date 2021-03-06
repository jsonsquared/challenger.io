ProgressBar = function(options) {
    var options = options || {}

    var self = this;
    this.value = options.value || 0
    this.width = options.width || 100
    this.id = options.id || 'progressbar-' + (new Date()).getTime()

    var markup = [
        "<div id='" + this.id + "' class='progressbar progress'>",
        "    <div class='container'></div>",
        "    <div class='pbmeter bar'></div>",
        "    <div class='pblabel'></div>",
        "</div>"
    ].join('')

    this.element = $(markup).appendTo(options.parentElement || '#meters')
    this.element.css({width:options.width})//, top:options.top || 0, left:options.left || 0})
    this.element.find('.pbmeter').css({width: options.value + '%', background:options.color ? options.color:''})//, background:options.color || '#C00'})
    this.element.find('.pblabel').text(options.text)

    this.remove = function() {
        this.element.fadeOut(100,function() {
            $(this).remove();
            delete self
        })
    }

    this.update = function(options) {
        options = options || this

        this.element.find('.pbmeter').stop().animate({width: options.value + '%'})
        this.element.find('.pblabel').text(options.text)
    }

    return this;

}