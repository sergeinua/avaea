/* global $ */
var ActionsStore = {
  getIconSpriteMap: function () {
    var iconSpriteMap = sessionStorage.getItem('iconSpriteMap');
    return JSON.parse(iconSpriteMap || '[]');
  }
}; //global object for communication with react components
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
// in order to control landscape view with responsive CSS

/**
 * Possible types
 * on_tile_choice | on_itinerary_purchase etc...
 *
 */
var logAction = function (type, data) {
  ClientApi.reqPost("/prediction/" + type, data);
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

//***** detect IE10 or IE11 and append string  ***** //
  var doc = document.documentElement;
  doc.setAttribute('data-useragent', navigator.userAgent);

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






