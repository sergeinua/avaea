/* global $ */
var heightNav = 0;

var recalculateBodyPadding = function () {
  setTimeout( function () {
    var tilesHeight = $('#tiles_ui>.row').outerHeight(true) || 0;
    var navHeight = $('#main_title').outerHeight(true) || 0;
    var searchTabsHeight = $('.flight-type-form').outerHeight(true) || 0;
    $('body').css('padding-top', ( tilesHeight + navHeight + searchTabsHeight ) + 'px');
    console.log($('body').css('padding-top'));
  } , 500);
};

$(document).ready(function() {
  var maxBucketVisibleFilters = 4; // amount visible filter-items per tile bucket
  var bucketFilterItemHeigh = 34; // pixes
  var bucketAirlineScrollPos = 0;

  $('#timeAlert').fadeOut(5000, function () {
    recalculateBodyPadding();
  });
  var showTotal = !!$('.itinerary:visible').length;
  /**
   * Possible types
   * on_tile_choice | on_itinerary_purchase
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

  //tile recalculation
  var recalcTiles = function () {
    var filters = $('.selectedfilters').attr('filters');
    filters = filters ? filters.split(' ') : [];
    var groups = {};
    if (filters.length) {
      filters.forEach(function(filter) {
        if (filter && filter != '') {
          var tileGroup = filter.replace(/(tile).+/, '$1');
          if (typeof groups[tileGroup] == 'undefined') {
            groups[tileGroup] = [];
          }
          groups[tileGroup].push(filter);
        }
      });
    }
    $('#tiles').find('li').each(function(item) {
      var tile = $(this);
      var sCount = 0;
      if (tile.hasClass('selected')) {
        sCount = $('.' + tile.attr('for') + ':visible').length;
      } else {
        if (tile.attr('for')) {
          var tileGroup = tile.attr('for').replace(/(tile).+/, '$1');
          var predictedClass = '.' + tile.attr('for');
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
      if ( sCount > 0 ) {
        $('[for='+tile.attr('for')+'] > span.badge').text(sCount);
        tile.removeClass('disabled');
      } else if ( sCount <= 0 ) {
        $('[for='+tile.attr('for')+'] > span.badge').text('');
        tile.removeClass('selected');
        var filters = $('.selectedfilters').attr('filters');
        filters = filters.split(' ');
        if (filters.length) {
          var _indx = filters.indexOf(tile.attr('for'));
          if (_indx != -1) {
            delete filters[_indx];
            $('.selectedfilters').attr('filters', filters.join(' '));
          }
        }
        tile.addClass('disabled');
      }
    });
    recalculateBodyPadding();
  };
  var filtersCount = {};
  var filterItineraries = function () {
    var filters = $('.selectedfilters').attr('filters');
    filters = filters ? filters.split(' ') : [];
    if (filters.length) {
      $('#clear, #undo').removeClass('disabled');
    } else {
      $('#clear, #undo').addClass('disabled');
    }
    $('.itinerary').show();
    $('.mybucket').each(function() {

      var selectedTileFilers = [];
      var tileName = $(this).attr('id');
      $(this).find('li').each(function() {
        var tileId = $(this).attr('for');
        if ($.inArray(tileId, filters) != -1) {
          selectedTileFilers.push(tileId);
        }
      });

      if (selectedTileFilers.length) {
        filtersCount[tileName] = $('.itinerary:visible').filter('.' + selectedTileFilers.join(',.')).length;
        $('.itinerary:visible').not('.' + selectedTileFilers.join(',.')).hide();
      }
    });

    if (showTotal) {
      var sCount = $('.itinerary:visible').length;
      $('#search_count').text(sCount);
      $('#search_count').removeClass('hidden');
      recalcTiles();
    }
  };

  filterItineraries();

  $('#clear').click(function() {
    if ($(this).hasClass('disabled')) {
      return;
    }
    $('.selectedfilters').attr('filters', '');
    $('#tiles').find('li.selected').removeClass('selected');
    //$($('.slick-slide')[0]).trigger('click');
    swiper.slideTo(0);
    filterItineraries();
  });

  $('#undo').click(function() {
    if ($(this).hasClass('disabled')) {
      return;
    }
    var filters = $('.selectedfilters').attr('filters');
    filters = filters.split(' ');
    if (filters.length) {
      var lastElement = filters[filters.length - 1];
      filters.pop();
      $('.selectedfilters').attr('filters', filters.join(' '));
      if (lastElement) {
        swiper.slideTo($('[for='+lastElement+']').parents('.swiper-slide').index());
        $('[for='+lastElement+']').removeClass('selected');
      }
      filterItineraries();
    }
  });

  $('.sort-button .dropdown-menu li').not('.divider').click(function() {
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
  });



  //tiles
  var firstSelectionCount = {};
  var globalSelectionCount = 0;
  var numberOfTiles = $('.mybucket').length;

  $('.list-group-item').click(function(event) {
    if ($(this).hasClass('disabled')) {
      return false;
    }

    var tileId = $(this).closest('.mybucket').attr('id');
    if(tileId == 'airline_tile') {
      $('#' + tileId).data("_is_touched", 1);
    }

    if ($(this).hasClass('selected')) {
      $(this).removeClass('selected');
      var filters = $('.selectedfilters').attr('filters');
      filters = filters.split(' ');

      //Check if the very last bucket in a tile is unselected
      var needRecalculate = !$(this).siblings('.selected').length;
      // log to abo
      logAction('on_tile_choice', {
        action      : 'filter_remove',
        tileName    : tileId,
        tileValue   : $(this).html(),
        tileId      : $(this).attr('for'),
        sample      : (-1.0*firstSelectionCount[ tileId ])/numberOfTiles,
        recalculate : needRecalculate
      });
      var result = [];
      var current = $(this).attr('for');
      if (filters.length) {
        filters.forEach(function(filter) {
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
        firstSelectionCount[ tileId ] = globalSelectionCount;
      }
      // log to abo
      logAction('on_tile_choice', {
        action      : 'filter_add',
        tileName    : tileId,
        tileValue   : $(this).html(),
        tileId      : $(this).attr('for'),
        sample      : (1.0*firstSelectionCount[ tileId ])/numberOfTiles,
        recalculate : needRecalculate
      });
    }
    // recalculate search result
    filterItineraries();

    scrollAirlines();
    swiper.slideTo($(this).parents('.swiper-slide').index());
  });


  //search count
  var sCount = $('.itinerary:visible').length;
  $('#search_count').text(sCount);
  if (showTotal) {
    $('#search_count').removeClass('hidden');
    recalculateBodyPadding();
    recalcTiles();
  }

  $('.itinerary-info').parent().click(function (event) {
    //$('.itinerary').removeClass('selected');
    //$(this).addClass('selected');
    var itineraryId = $(this).attr('id');
    var details = $(this).attr('for');
    if (details) {
      $('#' + details).toggle();

      if ($('#' + details).is(':visible')) {
        // disabled, TODO: confirm this functionality still needed
        /*if ($(this).hasClass('recommended')) {
         $(this).find('.itinerary-airline').find('span:last')
         .replaceWith($('<span class="label label-success"><span class="glyphicon glyphicon-star"></span>recommended</span>'));
         }*/

        logAction('on_itinerary_purchase', {
          action: 'itinerary_expanded',
          itinerary: {
            id: itineraryId
          }
        });
      } else {
        // disabled, TODO: confirm this functionality still needed
        /*if ($(this).hasClass('recommended')) {
         $(this).find('.itinerary-airline').find('span:last')
         .replaceWith($('<span class="glyphicon glyphicon-thumbs-up" style="color:forestgreen"></span>'));
         }*/
      }
    }

  });


  /**
   * Scroll to the destination element
   *
   * @param {object|string} elem Selector or object
   * @returns {$}
   */
  $.fn.scrollTo = function(elem) {
    if (!$(elem).offset()) {
      return;
    }
    $(this).slimScroll({scrollTo: $(this).scrollTop() - $(this).offset().top + $(elem).offset().top});
    return this;
  };

  var scrollAirlines = function() {
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
    if (_am_disabled < maxBucketVisibleFilters) {// not need scrolling
      return;
    }

    // Scroll to the first enabled filter
    var _scrollItem = $(_parentElem).children().not('.disabled').first();
    if (typeof _scrollItem == 'object') {
      $(_parentElem).scrollTo(_scrollItem);
    }
  };
  // Track and remember airlines scroll position
  $('#airline_tile .list-group').scroll(function () {
    bucketAirlineScrollPos = $(this).scrollTop();
  });

  // Horizontal scroll for tiles
  var swiper = new Swiper ('.swiper-container', {
    freeMode: true,
    slidesPerView: 'auto'
  });
  $( window ).resize(function() {
    recalculateBodyPadding();
  });


  // result page init
  {
    if ($('.flight-info').length) {
      $('.flight-info > div:first-child').css('padding-left', '0')
      $('button', '#main_title').prependTo('.flight-info > div:first-child').css('margin', '4px 0');
      $('#main_title > div.navbar-header').replaceWith($('.flight-info'));
      $('.flight-info').removeClass('hide').wrap('<div class="navbar-header"/>').wrap('<div class="container-fluid"/>');
      recalculateBodyPadding();
    }
    $('.list-group').slimScroll({
      height: '137px'
    });
  }

  // more/less button for merchandising
  $('.mymorebutton').click(function() {
    var _it = $(this).attr('for');
    var _mmcnt = '.mymorecontent' + _it;
    $(_mmcnt).toggleClass(function() {
      if($(_mmcnt).is( ".hidden" )) {
        $('#mymorebtn' + _it).text("less")
      } else {
        $('#mymorebtn' + _it).text("more")
      }
      return "hidden";
    });
    return false;
  });

  $('.buy-button>button').click(function (event) {
    var id = $(this).parents('.itinerary').attr('id');
    //if ($('.itinerary.selected')) {
    //  id = $('.selected').attr('id');
    //}
    //console.log('Order id:', id);
    if (id) {
      location.href = '/order?id=' + id;
    }
  });

});