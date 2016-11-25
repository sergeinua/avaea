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

    var max_filter_items = parseInt($('#tiles').data('max_filter_items'));
    if (max_filter_items > maxBucketVisibleFilters || max_filter_items == 0) {
      max_filter_items = maxBucketVisibleFilters;
    }
    $('.list-group').slimScroll({
      height: parseInt(max_filter_items * filterItemHeight) +'px',
      touchScrollStep: 30
    });
  }

  //tiles

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


