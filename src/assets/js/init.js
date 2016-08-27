/* global $ */
var SearchForm = {}; //global object for communication with react components
var isMobile = {
  Android: function() {
    return navigator.userAgent.match(/Android/i);
  },
  BlackBerry: function() {
    return navigator.userAgent.match(/BlackBerry/i);
  },
  iOS: function() {
    return navigator.userAgent.match(/iPhone|iPad|iPod/i);
  },
  Opera: function() {
    return navigator.userAgent.match(/Opera Mini/i);
  },
  Windows: function() {
    return navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i);
  },
  any: function() {
    return (typeof window.orientation !== 'undefined' // Deprecated legacy property. But remains for browser which support it
    || isMobile.Android() || isMobile.iOS() || isMobile.Windows() || isMobile.Opera() || isMobile.BlackBerry());
  }
};

// Deborah removed landscape function
// in order to landscape view with responsive CSS

/**
 * Possible types
 * on_tile_choice | on_itinerary_purchase etc...
 *
 */
var logAction = function (type, data) {
  $.ajax({
    method: "POST",
    url: "/prediction/" + type,
    data: data
  })
    .done(function( msg ) {
      //console.log( "Data Saved: ",  type, msg );
    });
};

function getCookie(name) {
  var matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

function setCookie(name, value, options) {
  options = options || {};

  var expires = options.expires;

  if (typeof expires == "number" && expires) {
    var d = new Date();
    d.setTime(d.getTime() + expires * 1000);
    expires = options.expires = d;
  }
  if (expires && expires.toUTCString) {
    options.expires = expires.toUTCString();
  }

  value = encodeURIComponent(value);

  var updatedCookie = name + "=" + value;

  for (var propName in options) {
    updatedCookie += "; " + propName;
    var propValue = options[propName];
    if (propValue !== true) {
      updatedCookie += "=" + propValue;
    }
  }

  document.cookie = updatedCookie;
}


$(document).ready(function() {
	
	$('#nav_slide_menu').offcanvas({
    toggle: false,
    placement: 'left'
  });
	
	/**
	 * *********  This is Deborah's script to manage desktop vs. touch   ********
	 * *********  but only for supported devices (iPhone, Android)       ********
	 */ 

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
	    
		});

	// else if touch, add classes to body
	} else {
		
	  // add 'touch' 
		$(function() {
			var body = $('body');
			body.addClass(' touch');
			
			// now get which device, add 'ios' or 'android'
			$(function() {
			  var userAgent = navigator.userAgent || navigator.vendor || window.opera;

			  if (userAgent.match((/iPad/i) || (/iPhone/i) || (/iPod/i))) {
			  	body.addClass(' ios');
			  	
			  } else if (userAgent.match(/Android/i)) {
			    body.addClass(' android');
			  }
			});
		});
	}
	
	
  $( window ).resize(function() {

  	// ------- Deborah removed landscape modal
  	// ------- because she will make it work 
  	// ------- beautifully for landscape

    // Deborah also removed this, it injected padding all the time, not just on results page
  	// will re-resolve this bug after merge
  	// DEMO-318 an unused horizontal stripe between tiles and itin summaries

  });
  
	
	//***** Deborah script - on scroll, add class to header ***** // 
  var header = $('header');
  $(window).scroll(function() {    
      var scroll = $(window).scrollTop();
      if (scroll >= 5) {
          header.addClass(' scrolled');
      } else {
          header.removeClass(' scrolled');
      }
  });
  // ***** end Deborah script *****
  
});
// ends dom ready


let nodes = [];

const ReactContentRenderer = {
  unmountAll() {
    if (nodes.length === 0) {
      return;
    }
    nodes.forEach(node => React.unmountComponentAtNode(node));
    nodes = [];
  },
  render(element, container, callback) {
    if (container instanceof jQuery) {
      container = container.get(0);
    }
    ReactDOM.render(element, container, callback);
    nodes.push(container);
  }
};

$(function () {
  $('#content')
    .on('content-will-change', ReactContentRenderer.unmountAll);
});






