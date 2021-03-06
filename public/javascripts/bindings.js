function initGameBindings() {
    $(viewport_canvas).bind('mousemove', function(e) {
        // crosshair.sprite.x = e.offsetX - 10;
        // crosshair.sprite.y = e.offsetY - 10;
        var deltaX = (e.offsetX) - viewport_canvas.width/2
        var deltaY = (e.offsetY) - viewport_canvas.height/2
        me.rotation = Math.atan2(deltaY, deltaX) / Math.PI * 180;

        if(connected) me.moved()
    }).bind('mousedown',function(e) {
        if(connected && e.button==0) {
            me.fire(e);
            me.singleClickFiring=true
            setTimeout(function() {
                me.singleClickFiring = false
            },intervals.fire.rate)
        }
    })

    $('body').bind('mousedown', function(e) {
        e.preventDefault()
    }).bind('mouseup', function(e) {
        e.preventDefault()
        me.recoil = 0;
    }).bind('mousewheel', function(e) {
        e.preventDefault()
    });

    $(document).unbind("contextmenu").bind("contextmenu",function(e) {
        if(hijackRightClick) {
            if(me.clip >= me.clipSize) return false
            socket.emit('manual_reload')
            return false
        }
    })

    $(document).bind('keydown', function(e) {

        // enter
        if(e.keyCode==13) {
            if($('input:focus').length==0) {
                $('#chat-input').focus();
            } else {
                var msg = $('#chat-input').val()
                if(connected) socket.emit('say', msg)
                $('#chat-input').blur().val('')
            }
        }

        // backspace/delete
        if(e.keyCode == 8 && $('input:focus').length==0) {
            return false
        }

        // escape
        if(e.keyCode == 27 && $('input:focus').length==1) {
            $('#chat-input').blur().val('')
        }

        // R
        if(e.keyCode == 82 && $('input:focus').length==0) {
            if(me.clip >= me.clipSize) return
            if(connected) socket.emit('manual_reload')
        }

        if($('input:focus').length==0 && ((e.keyCode >= 37 && e.keyCode <= 40) || e.keyCode==32)) return false
    })


    var lastKeyUp = {was:false, at:new Date()};
    $(document).bind('keyup',function(e) {
        lastKeyUp = {was:e.keyCode,at:new Date()}
    }).bind('keydown',function(e) {
        var now = new Date()
        if(now.getTime() - lastKeyUp.at.getTime() < 200 && e.keyCode == lastKeyUp.was) {
            lastKeyUp = {was:false, at:new Date()};
            if(e.keyCode==87 || e.keyCode==38) me.dash('U')
            if(e.keyCode==68 || e.keyCode==39) me.dash('R')
            if(e.keyCode==83 || e.keyCode==40) me.dash('D')
            if(e.keyCode==65 || e.keyCode==37) me.dash('L')
        } else {
            lastKeyUp = {was:false, at:now};
        }
    })

}