/* global $ */


export let isMobile = {
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
export function logAction(type, data) {
  ClientApi.reqPost("/prediction/" + type, data);
}

export function getCookie(name) {
  var matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

export function setCookie(name, value, options) {
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

export let maxBucketVisibleFilters = 4; // amount visible filter-items per tile bucket
export let bucketFilterItemHeigh = 34; // pixes
export let bucketAirlineScrollPos = 0;
export let heightNav = 0;
/**
 * Scroll to the destination element
 *
 * @param {object|string} elem Selector or object
 * @returns {$}
 */
$.fn.scrollTo = function(elem) {
  if (!$(elem).offset()) {
    return this;
  }
  $(this).slimScroll({scrollTo: $(this).scrollTop() - $(this).offset().top + $(elem).offset().top});
  return this;
};



export function  scrollAirlines() {
  // Bucket was touched. Not need scrolling
  if ($('#airline_tile').data('_is_touched')) {
    return;
  }

  // get parent object for the filters
  var _parentElem = $('#airline_tile .list-group');

  // Define start element of the bucket scroll window
  var start_elem = Math.round(bucketAirlineScrollPos / bucketFilterItemHeigh);
  var am_elems = $(_parentElem).children().length;
  // Iteration will overflow visible window
  if (start_elem + maxBucketVisibleFilters > am_elems) {
    start_elem = (am_elems > maxBucketVisibleFilters) ? (am_elems - maxBucketVisibleFilters) : 0;
  }

  // Define if a bucket has all disabled filters on an entire scroll window
  var _am_disabled = 0;
  for (var ii = start_elem; ii < (start_elem + maxBucketVisibleFilters); ii++) {
    _am_disabled = $(_parentElem).children().eq(ii).hasClass('disabled') ? (_am_disabled + 1) : _am_disabled;
  }
  if (_am_disabled < maxBucketVisibleFilters) // not need scrolling
    return;

  // Scroll to the first enabled filter
  var _scrollItem = $(_parentElem).children().not('.disabled').first();
  if (typeof _scrollItem == 'object') {
    $(_parentElem).scrollTo(_scrollItem);
  }
};
export let swiper;

$(document).ready(function() {

  $('#nav_slide_menu').offcanvas({
    toggle: false,
    placement: 'left'
  });

//***** detect IE10 or IE11 and append string  ***** //
  var doc = document.documentElement;
  doc.setAttribute('data-useragent', navigator.userAgent);


  var numberOfTiles = $('.mybucket').length;

  // Track and remember airlines scroll position
  $('#airline_tile .list-group').scroll(function () {
    bucketAirlineScrollPos = $(this).scrollTop();
  });

  var initScroll = 0;
  var scrollStarted = false;
  $('#searchResultData').scroll(function() {
    if (!scrollStarted) {
      initScroll = $(this).scrollTop();
      scrollStarted = true;
    }
    $('.buy-button-arrow[aria-expanded=true]').trigger('click');

    // Collapse
    if ( ($(this).scrollTop() - initScroll) >= 50 ) {
      scrollStarted = false;
    }
  });

  //------------ IE have to FORCE Bootstrap menu to open ----------
  if (navigator.appVersion.indexOf("MSIE 10") !== -1) {
    $('.sort-button').click(function(){
      if ($('.sort-button').attr('class', 'sort-button open')) {
        $('.sort-button').attr('class', 'sort-button');
      } else {
        $('.sort-button').attr('class', 'sort-button open');
      }
    });
  }
  // ----------------------------------------------------------------

});
// ends dom ready
