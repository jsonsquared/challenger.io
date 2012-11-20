function Message(text, options) {
    var options = options || {}

    this.font = options.font || 'bold 20px arial';
    this.color = options.color || '#FFF';
    this.text = text
    this.x = options.x || 0
    this.y = options.y || 400

    this.show = function(options) {

        var $markup = $([
            '<div class="message">' + this.text + '</div>'
        ].join(''))

        $('#messages').append($markup)
        $markup.css({fontSize:0}).animate({fontSize:20, top:-100},{
            duration: 750,
            easing: 'easeOutQuint',
            complete: function() {
                $(this).animate({fontSize:0},100, function() { $(this).remove(); })
            }
        })

    }

    this.show(options)
}