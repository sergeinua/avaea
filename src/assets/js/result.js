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

function _displayDimmer(flag) {
  if (flag) {
    var _topMarge = 0;
    if ($('.swiper-container').length) {
      _topMarge = $('.swiper-container').outerHeight(true);
      $('.dimmer').css('margin-top', _topMarge);
    }
    $('body').addClass('dimmer-show');
    $('.dimmer').show();
    $('#tiles_ui').addClass('hideArrow');
    $('.dimmer').off('click').on('click', function(){
      setCookie('dimmer_was_showed', 1);
      _displayDimmer(false);
    });

    $(document).on('mousewheel.dimmer touchmove.dimmer swipe.dimmer scroll.dimmer', function(event){
      event.stopPropagation();
      return false;
    });
  } else {
    $('.dimmer').css('margin-top', 0);
    $('body').removeClass('dimmer-show');
    $('.dimmer').hide();
    $('#tiles_ui').removeClass('hideArrow');
    $(document).off('mousewheel.dimmer touchmove.dimmer swipe.dimmer scroll.dimmer');
  }
}
/*
var getFilters = function () {
  var filter = $('.selectedfilters').attr('filters');
  filter = filter ? filter.split(' ') : [];
  return (filter.length > 0) ? $.map(filter, function (item) {
    if (item.length > 0) return item;
  }) : [];
};

var getDisFilters = function () {
  var filter = $('.selectedfilters').attr('filters-dis');
  filter = filter ? filter.split(' ') : [];
  return (filter.length > 0) ? $.map(filter, function (item) {
    if (item.length > 0) return item;
  }) : [];
};
*/
//tile recalculation
/*
var recalcTiles = function () {
  console.log('called recalcTiles');
  var filters = $.merge([], getFilters(), getDisFilters());
  var groups = {};
  console.log('filters.length',filters.length);
  if (filters.length) {
    filters.forEach(function (filter) {
      if (filter && filter != '') {
        var tileGroup = filter.replace(/(tile).+/, '$1');
        if (typeof groups[tileGroup] == 'undefined') {
          groups[tileGroup] = [];
        }
        groups[tileGroup].push(filter);
      }
    });
  }
  $('#tiles').find('li').each(function (item) {
    var tile = $(this);
    var sCount = 0;
    if (tile.hasClass('selected')) {
      sCount = $('.' + tile.attr('data-for') + ':visible').length;
    } else {
      if (tile.attr('data-for')) {
        var tileGroup = tile.attr('data-for').replace(/(tile).+/, '$1');
        var predictedClass = '.' + tile.attr('data-for');
        var predictedResult = $(predictedClass);

        for (var key in groups) {
          if (!groups.hasOwnProperty(key)) continue;

          if (key != tileGroup) {
            predictedResult = predictedResult.filter('.' + groups[key].join(',.'));
          }
        }
        sCount = predictedResult.length;
      }
    }

    var _filter = getFilters(),
      _disFilter = getDisFilters(),
      filtIndx = _filter.indexOf(tile.attr('data-for')),
      disFiltIndx = _disFilter.indexOf(tile.attr('data-for'));

    if (sCount > 0) {
      $('[for=' + tile.attr('data-for') + '] > span.badge').text(sCount);
      tile.removeClass('disabled');
      tile.removeClass('dis-selected');
      if (disFiltIndx != -1) {
        delete _disFilter[disFiltIndx];
        $('.selectedfilters').attr('filters-dis', _disFilter.join(' '));
        if (filtIndx == -1) {
          tile.addClass('selected');
          _filter.push(tile.attr('data-for'));
          $('.selectedfilters').attr('filters', _filter.join(' '));
          filterItineraries();
        }
      }
    } else if (sCount <= 0) {
      $('[for=' + tile.attr('data-for') + '] > span.badge').text('');
      tile.removeClass('selected');
      if (_filter.length) {
        var _indx = _filter.indexOf(tile.attr('data-for'));
        if (_indx != -1) {
          if (_disFilter.indexOf(_filter[_indx]) == -1) {
            _disFilter.push(_filter[_indx]);
            $('.selectedfilters').attr('filters-dis', _disFilter.join(' '));
          }
          tile.addClass('dis-selected');
          delete _filter[_indx];
          $('.selectedfilters').attr('filters', _filter.join(' '));
        }
      }
      tile.addClass('disabled');
    }
  });
};*/
// var showTotal = !!$('.itinerary:visible').length;

// var filtersCount = {};
// var filterItineraries = function () {

  // var filters = getFilters();
  // if (filters.length) {
  //   $('#clear, #undo').removeClass('disabled');
  // } else {
  //   $('#clear, #undo').addClass('disabled');
  // }
  // $('.itinerary').show();
  // $('.mybucket').each(function () {
  //
  //   var selectedTileFilers = [];
  //   var tileName = $(this).attr('id');
  //   $(this).find('li').each(function () {
  //     var tileId = $(this).attr('for');
  //     if ($.inArray(tileId, filters) != -1) {
  //       selectedTileFilers.push(tileId);
  //     }
  //   });
  //
  //   if (selectedTileFilers.length) {
  //     filtersCount[tileName] = $('.itinerary:visible').filter('.' + selectedTileFilers.join(',.')).length;
  //     $('.itinerary:visible').not('.' + selectedTileFilers.join(',.')).hide();
  //   }
  // });
  //
  // if (showTotal) {
  //   var sCount = $('.itinerary:visible').length;
  //   $('#search_count').text(sCount);
  //   $('#search_count').removeClass('hidden');
  //   recalcTiles();
  // }
// };

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
    if ($('.flight-info').length) {
      $('button', '#main_title').prependTo('.flight-info');
      $('#main_title > div.navbar-header').replaceWith($('.flight-info'));
      $('.flight-info').removeClass('hide').wrap('<div class="navbar-header"/>');
      // horrible!!!! Deborah fix this later
    }

    var max_filter_items = parseInt($('#tiles').data('max_filter_items'));
    if (max_filter_items > maxBucketVisibleFilters || max_filter_items == 0) {
      max_filter_items = maxBucketVisibleFilters;
    }
    $('.list-group').slimScroll({
      height: parseInt(max_filter_items * filterItemHeight) +'px',
      touchScrollStep: 30
    });
  }


  // Set sprite number for the every airlines icon
  // $('.itinerary-airline-icon').each(function () {
  //   $(this).css('background-position', '0 -' + $(this).data('sprite_num') * 15 + 'px');
  // });

  var showDimmer = getCookie('dimmer_was_showed') || 0;
  if (+showDimmer == 0 && typeof GlobalSearchResultCount != 'undefined' && GlobalSearchResultCount) {
    _displayDimmer(true);

    if (GlobalSearchResultCount < 5) {
      setTimeout(function () {
        $('.dimmer').fadeOut(function () {
          _displayDimmer(false);
        });
      }, 1000);
    }
  } else {
    _displayDimmer(false);
  }

  // showTotal = !!$('.itinerary:visible').length;


  // filterItineraries();

  // $('#clear').click(function () {
  //   $('.selectedfilters').attr('filters', '');
  //   $('.selectedfilters').attr('filters-dis', '');
  //   $('#tiles').find('li.selected').removeClass('selected');
  //   $('#tiles').find('li.dis-selected').removeClass('dis-selected');
  //   swiper.slideTo(0);
  //   filterItineraries();
  // });
  //
  // $('#undo').click(function () {
  //   if ($(this).hasClass('disabled')) {
  //     return;
  //   }
  //   var filters = getFilters();
  //   if (filters.length) {
  //     var lastElement = filters[filters.length - 1];
  //     filters.pop();
  //     $('.selectedfilters').attr('filters', filters.join(' '));
  //     if (lastElement) {
  //       swiper.slideTo($('[for=' + lastElement + ']').parents('.swiper-slide').index());
  //       $('[for=' + lastElement + ']').removeClass('selected');
  //     }
  //     filterItineraries();
  //   }
  // });

  /*$('.sort-button .dropdown-menu li').not('.divider').click(function () {
    if (!$(this).hasClass('selected')) {
      $('span.caret', '.sort-button .dropdown-menu li.selected').addClass('hide');
      $('.sort-button .dropdown-menu li.selected').removeAttr('order').removeClass('selected');
      $('span.caret', this).removeClass('hide');
      $(this).addClass('selected');
    }
    $('.sort-button button > i').replaceWith($('i', this).clone());
    var
      sort = $(this).attr('sort'),
      order = 'asc';
    $(this).removeClass('dropup');
    if ($(this).attr('order') == 'asc') {
      $(this).addClass('dropup');
      order = 'desc';
    }
    if (order == 'asc') {
      $('#sort-menu-direction').html('&darr;');
    } else {
      $('#sort-menu-direction').html('&uarr;');
    }
    $(this).attr('order', order);
    var itineraries = $('.itinerary');
    itineraries.sort(function (a, b) {
      var
        a = parseFloat($(a).data(sort)),
        b = parseFloat($(b).data(sort));
      if (order == 'desc') {
        b = [a, a = b][0];
      }
      return (a > b) ? 1 : ((a < b) ? -1 : 0);
    });
    $('#searchResultData').append(itineraries);
  });*/

  // more/less button for merchandising
  // $('.mymorebutton').click(function () {
  //   var _it = $(this).attr('for');
  //   var _mmcnt = '.mymorecontent' + _it;
  //   $(_mmcnt).toggleClass(function () {
  //     if ($(_mmcnt).is(".hidden")) {
  //       $('#mymorebtn' + _it).text("less")
  //     } else {
  //       $('#mymorebtn' + _it).text("more")
  //     }
  //     return "hidden";
  //   });
  //   return false;
  // });

  // disabled, TODO: confirm this functionality still needed
  /*$('.recommended').each(function(item){
   // $(this).find('div:first').find('div:first').find('div:first')
   $(this).find('.itinerary-airline')
   .append($('<span class="glyphicon glyphicon-thumbs-up" style="color:forestgreen"></span>'));
   });*/

  //tiles
  // var firstSelectionCount = {};
  // var globalSelectionCount = 0;
  var numberOfTiles = $('.mybucket').length;
/*
  $('.list-group-item').click(function (event) {

    _displayDimmer(false);

    if ($(this).hasClass('disabled')) {
      return false;
    }

    var tileId = $(this).closest('.mybucket').attr('id');
    if (tileId == 'airline_tile') {
      $('#' + tileId).data("_is_touched", 1);
    }

    if ($(this).hasClass('selected')) {
      $(this).removeClass('selected');
      var filters = getFilters();

      //Check if the very last bucket in a tile is unselected
      var needRecalculate = !$(this).siblings('.selected').length;
      // log to abo
      logAction('on_tile_choice', {
        action: 'filter_remove',
        tileName: tileId,
        tileValue: $(this).html(),
        tileId: $(this).attr('for'),
        sample: (-1.0 * firstSelectionCount[tileId]) / numberOfTiles,
        recalculate: needRecalculate
      });
      var result = [];
      var current = $(this).attr('for');
      if (filters.length) {
        filters.forEach(function (filter) {
          if (filter && filter != current && filter != '') {
            result.push(filter);
          }
        });

        $('.selectedfilters').attr('filters', result.join(' '));
      }
    } else {
      $(this).addClass('selected');
      var filters = $('.selectedfilters').attr('filters');
      $('.selectedfilters').attr('filters', filters + ' ' + $(this).attr('for'));

      // Check if the very first bucket in a tile is selected
      var needRecalculate = !$(this).siblings('.selected').length;
      globalSelectionCount++;
      if (needRecalculate) {
        firstSelectionCount[tileId] = globalSelectionCount;
      }
      // log to abo
      logAction('on_tile_choice', {
        action: 'filter_add',
        tileName: tileId,
        tileValue: $(this).html(),
        tileId: $(this).attr('for'),
        sample: (1.0 * firstSelectionCount[tileId]) / numberOfTiles,
        recalculate: needRecalculate
      });
    }
    // recalculate search result
    filterItineraries();

    scrollAirlines();
    swiper.slideTo($(this).parents('.swiper-slide').index());
  });
*/
  // Track and remember airlines scroll position
  $('#airline_tile .list-group').scroll(function () {
    bucketAirlineScrollPos = $(this).scrollTop();
  });

  // Horizontal scroll for tiles
  swiper = new Swiper('.swiper-container', {
    freeMode: true,
    slidesPerView: 'auto',
  });
  

  //search count
  // var sCount = $('.itinerary:visible').length;
  // $('#search_count').text(sCount);
  // if (showTotal) {
  //   $('#search_count').removeClass('hidden');
  //   recalcTiles();
  // }

  // DEMO-429 Collapse tiles
  // $('.clickable-tiles-area-yellow').click(function () {
  //   if ($('.clickable-tiles-area').hasClass('hidden')) {
  //     shrinkTiles(false);
  //   }
  //   return false;
  // });
  // $('.clickable-tiles-area').click(function () {
  //   shrinkTiles(true);
  //   return false;
  // });
  // var tilesHeightFull = $('#tiles').outerHeight();
  // var shrinkTiles = function (revert) {
  //   if (!revert) {
  //     if ($('#tiles').outerHeight() !== 20 && $('#searchResultData').outerHeight() >= $('body').outerHeight()) {
  //       tilesHeightFull = $('#tiles').outerHeight();
  //       $('#tiles').outerHeight(20);
  //       $('.clickable-tiles-area').removeClass('hidden');
  //       $('body').removeClass('show-tiles-arrow');
  //     }
  //   } else {
  //     $('.clickable-tiles-area').addClass('hidden');
  //     $('#tiles').outerHeight(tilesHeightFull);
  //     initScroll = $(window).scrollTop();
  //   }
  // };
  if ($(".swiper-container").length) {
    $(".swiper-container").hammer();
    $(".swiper-container").data('hammer').get('swipe').set({direction: Hammer.DIRECTION_VERTICAL});
    $(".swiper-container").bind("swipeup", function (e) {
      SearchForm.toggleFullInfo(false);
    }).bind("swipedown", function (e) {
      SearchForm.toggleFullInfo(true);
    });
  }

  var expandedItitns = 0;
  /*
  $('.itinerary-info').parent().click(function (event) {
    //$('.itinerary').removeClass('selected');
    //$(this).addClass('selected');
    var itineraryId = $(this).attr('id');
    var details = $(this).attr('for');
    if (details) {
      $('#' + details).toggle();

      if ($('#' + details).is(':visible')) {
        expandedItitns++;

        logAction('on_itinerary_purchase', {
          action: 'itinerary_expanded',
          itinerary: {
            id: itineraryId
          }
        });
      } else {
        expandedItitns--;
      }
    }

    //$('#buy_button').removeAttr('disabled');
  });
  */
  //
  // $('[id*=buy-button-]').click(function (event) {
  //   var id = $(this).parents('.itinerary').attr('id');
  //   if (id) {
  //     location.href = '/order?id=' + id + '&searchId='+ $('#searchId').val();
  //   }
  // });
  // $('[id*=buy-cron-button-]').on('click touchstart', function (event) {
  //   var id = $(this).parents('.itinerary').attr('id');
  //   if (id) {
  //     location.href = '/order?special=1&id=' + id + '&searchId='+ $('#searchId').val();
  //   }
  // });

  var initScroll = 0;
  var scrollStarted = false;
  $('#searchResultData').scroll(function() {
    if ($(this).scrollTop() == 0 ) {
      SearchForm.toggleFullInfo(true);
    }
    if (!scrollStarted) {
      initScroll = $(this).scrollTop();
      scrollStarted = true;
    }
    $('.buy-button-arrow[aria-expanded=true]').trigger('click');

    //DEMO-429 Collapse tiles
    if ( ($(this).scrollTop() - initScroll) >= 100 ) {
      SearchForm.toggleFullInfo(false);
      scrollStarted = false;
    }
  });


  $('.result-search-info-bar').click(function (event) {
    location.href = '/search';
  });

});


