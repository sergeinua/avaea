/* global $ */

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

var isLandscapeMode = function () {
  if ( typeof window.orientation == 'undefined' ) {
    return (window.outerHeight < window.outerWidth)
  }
  return (window.orientation == 90 || window.orientation == -90);
};

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


  $( window ).resize(function() {
    $('body').removeClass('landscape-mode');
    if (isLandscapeMode()) {
      $('body').addClass('landscape-mode');
      if (isMobile.any() && $('#landscapeMode').length) {
        $('#landscapeMode').modal('show');
        $('#landscapeMode').data('bs.modal').$backdrop.css('background-color','white');
        $('#landscapeMode').data('bs.modal').$backdrop.css('opacity', 1);
      }
    } else {
      if(isMobile.any()) {
        $('#landscapeMode').modal('hide');
      }
    }

    //DEMO-318 an unused horizontal stripe between tiles and itin summaries
    var tilesHeight = $('#tiles_ui>.row').outerHeight(true) || 0;
    var navHeight = 50;
    if (window.innerWidth >= 480) {
      navHeight = 30;
    }
    $('body').css('padding-top', ( tilesHeight + navHeight  ) + 'px');
  });
});


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
