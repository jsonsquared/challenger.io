var input = {
  keyboard : [],
  mouse: {}
};
$(function() {
   $(document).keydown(function (e) {

    input.keyboard[e.keyCode]=true;
    if(e.keyCode==16) input.shift = true;
    if(e.keyCode==17) input.control = true;
  }).keyup(function (e) {
    input.keyboard[e.keyCode] = false;
    if(e.keyCode==16) input.shift = false;
    if(e.keyCode==17) input.control = false;
  })
  document.addEventListener("mousedown", function(e) {
    input.mouse[e.button] = true;
  }, false);
  document.addEventListener("mouseup", function(e) {
    input.mouse[e.button] = false
  },false);
  document.addEventListener("mousemove", function(e) {
    input.mouse.x = e.pageX;
    input.mouse.y = e.pageY;
  },false);

  // touch input
  document.addEventListener("touchstart",function(e) {
      input.touch = true;
      input.touchX = e.changedTouches[0].screenX;
      input.touchY = e.changedTouches[0].screenY;
      e.preventDefault();
  });
  document.addEventListener("touchmove",function(e) {
      input.touchEvent = e;
      input.touchX = e.changedTouches[0].screenX;
      input.touchY = e.changedTouches[0].screenY;
  });
  document.addEventListener("touchend",function(e) {
      input.touch = false;
  });
});

jQuery.fn.single_double_click = function(single_click_callback, double_click_callback, timeout) {
  return $(this).each(function(){
    var clicks = 0, self = this;
    var handler = function(event) {
      clicks++;
      if (clicks == 1) {
        setTimeout(function(){
          if(clicks == 1) {
            single_click_callback.call(self, event);
          } else {
            double_click_callback.call(self, event);
          }
          clicks = 0;
        }, timeout || 500);
      }
    };
    jQuery(this).unbind("click").bind("click",handler)
    jQuery(this).unbind("contextmenu").bind("contextmenu",function(e) { handler(e); if(hijackRightClick) { e.preventDefault(); }})
  });
}