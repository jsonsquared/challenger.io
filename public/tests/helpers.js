function joinGame() {	
    $('#name').val('qunit')
    $('#join-button').click()        
}

function holdKey(code, ms, callback) {
    var event = $.Event( "keydown" );
    event.keyCode = code;
    $(document).trigger( event );
  
    setTimeout(function() {
    var event = $.Event( "keyup" );
      event.keyCode = code;
      $(document).trigger( event );
      if(typeof callback == 'function') callback()
    },ms)
}

function disableWalls() {
	blocked = function() { return false }
	halfBlocked = function() { return false }	
}