function initGameBindings() {
    $(canvas_main).bind('mousemove', function(e) {
        crosshair.sprite.x = e.offsetX - 10;
        crosshair.sprite.y = e.offsetY - 10;

        if(connected) me.moved()
    }).bind('click',function(e) {
        if(connected) me.fire(e);
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
            if(me.clip >= me.clipMax) return
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
        }
    })

}