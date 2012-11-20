function initIntervals() {
    intervals.push.interval = setInterval(function() {
        if(lastPush.x != me.payload.x || lastPush.y != me.payload.y || lastPush.rotation != me.payload.rotation) {
            socket.emit('move', me.payload)
            lastPush = me.payload;
        }
    },intervals.push.rate)

    intervals.move.interval = setInterval(function() {
        var move = {};
        if($('input:focus').length==0) {
            if(INPUT_U()) { move.y = me.y - me.moveDistance }
            if(INPUT_L()) { move.x = me.x - me.moveDistance }
            if(INPUT_D()) { move.y = me.y + me.moveDistance }
            if(INPUT_R()) { move.x = me.x + me.moveDistance }
            if(move.x || move.y) me.move(move)
        }
    },intervals.move.rate)

    intervals.fire.interval = setInterval(function() {
        if(me.singleClickFiring) return
        if(input.mouse[0] || (input.keyboard[32] && $('input:focus').length==0)) {
            me.fire({offsetX:crosshair.sprite.x, offsetY: crosshair.sprite.y})
            me.recoil+=2
        }
    },intervals.fire.rate)
}