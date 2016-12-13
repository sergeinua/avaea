

$(document).ready(function() {
	
	//******** touch device detection and animation ******** //	
	
	// detect if is touch
	function isTouchDevice(){
    return typeof window.ontouchstart !== 'undefined';
	}

	// if not touch
	if (!isTouchDevice()) {
		
		// add 'desktop' class to body
		$(function() {
	    var body = $('body');
	    body.addClass(' desktop');
	    
	    var doc = document.documentElement;
	    doc.setAttribute('data-viewport', 'desktop');
	    
		});
 
	// else if touch, add classes to body
	} else {
		
	  // add 'touch' 
		$(function() {
			var body = $('body');
			body.addClass(' touch');
			
			var doc = document.documentElement;
	    doc.setAttribute('data-viewport', 'touch');
			
			// now get which device, add 'ios' or 'android'
			$(function() {
			  var userAgent = navigator.userAgent || navigator.vendor || window.opera;
			  var doc = document.documentElement;

			  if (userAgent.match((/iPad/i) || (/iPhone/i) || (/iPod/i))) {
			  	body.addClass(' ios');
			  	doc.setAttribute('data-viewport', 'touch ios');
			  	
			  } else if (userAgent.match(/Android/i)) {
			    body.addClass(' android');
			    doc.setAttribute('data-viewport', 'touch Android');
			  }
			});
		});
	}
	
//***** on scroll, add class to header ***** // 
  var header = $('header');
  $(window).scroll(function() {    
      var scroll = $(window).scrollTop();
      if (scroll >= 5) {
          header.addClass(' scrolled');
      } else {
          header.removeClass(' scrolled');
      }
  });
	
	
  //***** footer copyright *****//
  
  $( ".copyright" ).html(function() {
    var d = new Date();
    var writedate = ('&copy;' + d.getFullYear() + ' Avaea.com');
    return writedate;
  });
  
});










