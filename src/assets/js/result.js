/* global $ */

var maxBucketVisibleFilters = 4; // amount visible filter-items per tile bucket
var filterItemHeight = 31.25; // pixels
var bucketFilterItemHeigh = 34; // pixes
var bucketAirlineScrollPos = 0;
var heightNav = 0;
/**
 * Scroll to the destination element
 *
 * @param {object|string} elem Selector or object
 * @returns {$}
 */
$.fn.scrollTo = function(elem) {
  if (!$(elem).offset()) return;
  $(this).slimScroll({scrollTo: $(this).scrollTop() - $(this).offset().top + $(elem).offset().top});
  return this;
};



var scrollAirlines = function () {
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
var swiper;


$(document).ready(function() {

  // result page init
  {
    // if ($('.flight-info').length) {
    //   $('button', '#main_title').prependTo('.flight-info');
    //   $('#main_title > div.navbar-header').replaceWith($('.flight-info'));
    //   $('.flight-info').removeClass('hide').wrap('<div class="navbar-header"/>');
    //   // horrible!!!! Deborah fix this later
    // }

    var max_filter_items = parseInt($('#tiles').data('max_filter_items'));
    if (max_filter_items > maxBucketVisibleFilters || max_filter_items == 0) {
      max_filter_items = maxBucketVisibleFilters;
    }
    $('.list-group').slimScroll({
      height: parseInt(max_filter_items * filterItemHeight) +'px',
      touchScrollStep: 30
    });
  }
  /* ------------- LOGIC FOR THE DIMMER ------------------
   1) don't show the dimmer if user already saw it
   2) don't show the dimmer if results are fewer than 10
   user should only see dimmer on first ever load of results that are > 10
   ----------------------------------------------------- */

  var displayDimmer = function () {

    // get the cookie, was dimmer shown?
    var showDimmer = getCookie('dimmer_was_showed');

    if (showDimmer !=="true") {

      // dimmer was not already shown
      // check if search results are < 10
      if (typeof GlobalSearchResultCount != 'undefined' && GlobalSearchResultCount < 10) {

        // there were < 10 results, not enough to show the dimmer
        $('.dimmer').attr('style', 'display: none;');

      } else {

        // there were > 10 results, so show it's ok to show the dimmer,
        // on click anywhere, remove it and set the cookie to "dimmer was shown"
        $('.dimmer').attr('style', 'display: inline-block;');
        $('body').click(function(){
          // user saw it so don't show it again for about 20 years
          setCookie('dimmer_was_showed', "true", 10000);
          $('.dimmer').attr('style', 'display: none;');
        });
      }

    } else {
      // dimmer shown was true
    }
  };
  displayDimmer();

  //tiles

  var numberOfTiles = $('.mybucket').length;

  // Track and remember airlines scroll position
  $('#airline_tile .list-group').scroll(function () {
    bucketAirlineScrollPos = $(this).scrollTop();
  });

    // correctly initialize the swiper for desktop vs. touch
    function isTouchDevice(){
      return typeof window.ontouchstart !== 'undefined';
    }

    if (!uaMobile) {
      // is desktop
      swiper = new Swiper('.swiper-container', {
        freeMode: true,
        slidesPerView: '5.5'
      });

    } else {
      // is touch
      swiper = new Swiper('.swiper-container', {
        freeMode: true,
        slidesPerView: 'auto'
      });
    }


  if ($(".swiper-container").length) {
       $(".swiper-container").hammer();
       $(".swiper-container").data('hammer').get('swipe').set({direction: Hammer.DIRECTION_VERTICAL});
       $(".swiper-container").bind("swipeup", function (e) {
         ActionsStore.toggleFullInfo(false);
       }).bind("swipedown", function (e) {
         ActionsStore.toggleFullInfo(true);
       });
  }


  var initScroll = 0;
  var scrollStarted = false;
  $('#searchResultData').scroll(function() {
    if ($(this).scrollTop() == 0 ) {
      ActionsStore.toggleFullInfo(true);
    }
    if (!scrollStarted) {
      initScroll = $(this).scrollTop();
      scrollStarted = true;
    }
    $('.buy-button-arrow[aria-expanded=true]').trigger('click');

    // Collapse
    if ( ($(this).scrollTop() - initScroll) >= 50 ) {
      ActionsStore.toggleFullInfo(false);
      scrollStarted = false;
    }
  });


  $('.result-search-info-bar').click(function (event) {
    location.href = '/search';
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

