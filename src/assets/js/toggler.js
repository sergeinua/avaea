/* global $ */
var fly = function (target) {
  var pos = $(target).position();
  var speed = 1;
  if ($('body').outerWidth() < pos.left+speed) {
    pos.left = -50;
  }
  $(target).css('left', pos.left+speed);
};

$(document).ready(function() {
  var maxBucketVisibleFilters = 4; // amount visible filter-items per tile bucket
  var bucketFilterItemHeigh = 34; // pixes
  var bucketAirlineScrollPos = 0;
  var heightNav = 0;
  var searchApiMaxDays = 330; // Mondee API restriction for search dates at this moment

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

  var recalculateBodyPadding = function () {
    $('body').removeClass('landscape-mode');
    if (window.outerWidth > window.outerHeight) {
      $('body').addClass('landscape-mode');
      if (isMobile.any()) {
        $('#landscapeMode').modal('show');
      }
    } else {
      if(isMobile.any()) {
        $('#landscapeMode').modal('hide');
      }
    }

    var tilesHeight = $('#tiles_ui>.row').outerHeight(true) || 0;
    var navHeight = $('#main_title').outerHeight(true) || 0;
    $('body').css('padding-top', ( tilesHeight + navHeight  ) + 'px');
  };

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

  $('.mymoreprofilebutton').click(function(el) {
    var cloneTarget = $(this).attr('for');
    var clone = $('#' + cloneTarget).clone().find("input").val("").end();

    clone.find('hr').removeClass('hidden');
    clone.appendTo($('#' + cloneTarget).parent());
    return false;
  });

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

  // disabled, TODO: confirm this functionality still needed
  /*$('.recommended').each(function(item){
    // $(this).find('div:first').find('div:first').find('div:first')
    $(this).find('.itinerary-airline')
      .append($('<span class="glyphicon glyphicon-thumbs-up" style="color:forestgreen"></span>'));
  });*/
  /*

   //set dates for search request
   //min attr for date pickers
   $('#departureDate').attr('min', new Date().toISOString().slice(0, 10));
   $('#departureDate').change(function() {
   $('#returnDate').attr('min', $('#departureDate').val().replace(/\s/g, ''));
   });
   // Set +14days for empty returnDate
   $('#returnDate').focus(function(){
   if($('#returnDate').val().trim() == '' && $('#departureDate').val().trim() != '')
   {
   var dd = Date.parse($('#departureDate').val().replace(/\s/g, ''));
   $('#returnDate').val(new Date(dd + 86400000*14).toISOString().slice(0, 10));
   $('#returnDate').attr('min', $('#departureDate').val().replace(/\s/g, ''));
   }
   });
   */

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

  var scrollAirlines = function() {
    // Bucket was touched. Not need scrolling
    if($('#airline_tile').data('_is_touched')) {
      return;
    }

    // get parent object for the filters
    var _parentElem = $('#airline_tile .list-group');

    // Define start element of the bucket scroll window
    var start_elem = Math.round(bucketAirlineScrollPos / bucketFilterItemHeigh);
    var am_elems = $(_parentElem).children().length;
    // Iteration will overflow visible window
    if(start_elem + maxBucketVisibleFilters > am_elems) {
      start_elem = (am_elems > maxBucketVisibleFilters) ? (am_elems - maxBucketVisibleFilters) : 0;
    }

    // Define if a bucket has all disabled filters on an entire scroll window
    var _am_disabled = 0;
    for (var ii = start_elem; ii < (start_elem + maxBucketVisibleFilters); ii++) {
      _am_disabled = $(_parentElem).children().eq(ii).hasClass('disabled') ? (_am_disabled + 1) : _am_disabled;
    }
    if(_am_disabled < maxBucketVisibleFilters) // not need scrolling
      return;

    // Scroll to the first enabled filter
    var _scrollItem = $(_parentElem).children().not('.disabled').first();
    if(typeof _scrollItem == 'object') {
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
    slidesPerView: 'auto',
    onSlideNextStart: function(swiper) {
      $('body').removeClass('show-tiles-arrow');
      // set cookie that user has already scrolled - set cookie for 1 year
      setCookie('tiles-scrolled', 1, {expires: (86400 * 30 * 12), domain: document.location.hostname});
    }
  });
  $( window ).resize(function() {
    recalculateBodyPadding();
  });

  /**
   * Make request to the remote server and fetch data for the typehead rendering
   *
   * @param {string} controllerName
   * @param {string} actionName
   * @returns {Function}
   */
  var fetchTypeheadSrc = function(controllerName, actionName) {
    return function (q, cb) {
      $.ajax({
          url: '/'+controllerName+'/'+actionName,
          type: 'get',
          data: {q: q},
          dataType: 'json',
          async: false // required, because typehead doesn't work with ajax in async mode
        })
        .done(function( msg ) {
          cb(msg ? msg : []);
        })
        .fail(function (msg) {
          cb([{city: "System error", name: "please try later", value: "---"}]);
        });
    };
  };

  var drawAirportData = function (target) {
    var cityName = $('#' + target).attr('city');
    var airportCode = $('#' + target).val();
    if (target == 'originAirport') {
      if (airportCode) {
        $('#from-area').addClass('hidden');
        $('#from-area-selected').removeClass('hidden');
        $('#from-airport-selected').text(airportCode);
        $('#from-city-selected').text(cityName);
        if($('#from-area').hasClass("error_elem")) {
          $('#from-area').removeClass("error_elem");
        }
      } else {
        $('#from-area-selected').addClass('hidden');
        $('#from-area').removeClass('hidden');
        $('#from-airport-selected').text('');
        $('#from-city-selected').text('');
      }
    } else if (target == 'destinationAirport') {
      if (airportCode) {
        $('#to-area').addClass('hidden');
        $('#to-area-selected').removeClass('hidden');
        $('#to-airport-selected').text(airportCode);
        $('#to-city-selected').text(cityName);
        if($('#to-area').hasClass("error_elem")) {
          $('#to-area').removeClass("error_elem");
        }
      } else {
        $('#to-area-selected').addClass('hidden');
        $('#to-area').removeClass('hidden');
        $('#to-airport-selected').text('');
        $('#to-city-selected').text('');
      }
    }
  };

  $('#airport-input').typeahead({
    hint: true,
    highlight: true,
    minLength: 2
  }, {
    name: 'airports',
    display: 'value',
    limit: 99, // Increase default value. Will limited by controller
    source: fetchTypeheadSrc('ac', 'airports'),
    templates: {
      empty: [
        '<div class="empty-message">',
        'unable to find the airport that match the current query',
        '</div>'
      ].join('\n'),
      suggestion: function(vars) {
        return '<div>('+vars.value+') '+vars.city+', '+vars.name+'</div>';
      }
    }
  }).on('typeahead:selected', function (obj, datum) {
    $('#' + $(this).attr('target')).val(datum.value);
    $('#' + $(this).attr('target')).attr('city', datum.city);
    $('#search_title').addClass('hidden');
    $('#main').removeClass('hidden');
    $('#main_title').removeClass('hidden');
    $('#airport-input').val('');
    $('#airport-input').typeahead('val','');
    $('.navbar-header').height(heightNav);
    drawAirportData($(this).attr('target'));
  });
  $('.tt-hint').addClass('form-control');

  //search count
  var sCount = $('.itinerary:visible').length;
  $('#search_count').text(sCount);
  if (showTotal) {
    $('#search_count').removeClass('hidden');
    recalculateBodyPadding();
    recalcTiles();
  }

  //loading
  $('.search-top-button').click(function () {
    $('#topSearchOnly').val(1);
  });
  $('.search-button').click(function () {
    $('#topSearchOnly').val(0);
  });
  $('#search_form').submit(function (event) {
    var _isError = false;

    if ($('.search-button').hasClass('disabled')) {
      _isError = true;
    }

    // Check airports selection
    if ($('#originAirport').val() == '') {
      $('#from-area').addClass("error_elem");
      _isError = true;
    }
    if ($('#destinationAirport').val() == '') {
      $('#to-area').addClass("error_elem");
      _isError = true;
    }

    // Check existence of the return date for the round trip
    if ($('#returnDate').val() == '' && $('.flight-type-item.active-choice').attr('id') == 'round_trip') {
      $('.flight-date-info-item.ret').addClass("error_elem");
      _isError = true;
    }

    if (_isError) {
      return false;
    }

    $("#searchBanner").modal();
    $('#search_form').attr('action', '/result?s=' + btoa(JSON.stringify($( this ).serializeArray())));

    $('.search-button').hide();
    $('.search-top-button').hide();
    $("body").addClass("loading");
    $('#planePath').removeClass('hidden');
    setInterval('fly("#plane")', 40);
    return true;
  });

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

    //$('#buy_button').removeAttr('disabled');
  });

  $('.buy-button>button').click(function (event) {
    var id = $(this).parents('.itinerary').attr('id');
    //if ($('.itinerary.selected')) {
    //  id = $('.selected').attr('id');
    //}
    //console.log('Order id:', id);
    if (id) {
      location.href = '/order?id=' + id + '&searchId='+ $('#searchId').val();
    }
  });

  /**
   * Client validation during booking of itinerary
   */
  $("#form_booking").validate({
    rules: {
      PaxType: {
        required: true
      },
      FirstName: {
        required: true
      },
      LastName: {
        required: true
      },
      Gender: {
        required: true
      },
      DateOfBirth: {
        required: true,
        date: true,
        minlength: 10,
        maxlength: 10
      },
      Address1: {
        required: true
      },
      City: {
        required: true
      },
      State: {
        required: true
      },
      Country: {
        required: true
      },
      ZipCode: {
        required: true
      },
      CardType: {
        required: true
      },
      CardNumber: {
        required: true,
        digits: true,
        minlength: 16,
        maxlength: 16
      },
      ExpiryDate: {
        required: true,
        minlength: 7,
        maxlength: 7
      },
      CVV: {
        required: true,
        digits: true,
        minlength: 3,
        maxlength: 3
      }
    },
    errorPlacement: function(error, element){}, // Skip error messages
    highlight: function(input) {
      $(input).parent().addClass('has-error');
    },
    unhighlight: function(input) {
      $(input).parent().removeClass('has-error');
    }
    //onkeyup: false
  });

  //remove fieldset
  $('.remove-fieldset').click(function(event){
    var fieldset = $(this).attr('fieldset'),
      iterator = $(this).attr('iterator');

    $.ajax({
        method: "POST",
        url: "/user/removeFieldSet",
        data: {fieldset: fieldset, iterator: iterator}
      })
      .done(function( msg ) {


        if (msg.error) {

          $('#timeAlert').text('Error saving data to ' + fieldset + '.')
            .fadeIn('slow', function () {
                $(this).fadeOut(5000, function () {
                  recalculateBodyPadding();
                });
              }
            );

        } else {

          $('#' + fieldset + '[fieldset-number="' + iterator + '"]').remove();
          $('#' + fieldset + ':first > hr').remove();
          if ($('#' + fieldset + ' .remove-fieldset').length == 1) {
            $('#' + fieldset + ' .remove-fieldset').remove();
          }

          $('#timeAlert').text('Record was removed successfully.')
            .fadeIn('slow', function () {
                $(this).fadeOut(5000, function () {
                  recalculateBodyPadding();
                });
              }
            );
        }
      });

  });

  var getIconForAirline = function (el) {
    var _image = new Image(),
      _code = el.data('code'),
      _file = '/images/airlines/' + _code + '.png';
    _image.onload = function () {
      el.attr('src', _file);
    };
    _image.src = _file;
  };

  $('.airlineIcon').each(function () {
    getIconForAirline($(this));
  });

  /* Depart/Return Date selection {{{ */

  // init datetimepickers {{{
  $('#depart_picker').datetimepicker({
    inline: true,
    format: "YYYY-MM-DD",
    minDate: moment(),
    defaultDate: $('#departureDate').val() || moment()
  });

  $('#return_picker').datetimepicker({
    inline: true,
    format: "YYYY-MM-DD",
    minDate: moment($('#depart_picker').data("DateTimePicker").date()),
    maxDate: moment().add(2, 'years'),
    defaultDate: $('#returnDate').val() || moment($('#depart_picker').data("DateTimePicker").date()).add(14, 'days')
  });
  // }}} datetimepickers

  // bind dp.change event {{{
  function setDisplayedDate(context_sel, dest_date) {
    var _moment = moment(dest_date);
    $('.weekday', context_sel).text(_moment.format('dddd'));
    $('.tap-date', context_sel).text(_moment.format('DD'));
    $('.tap-month', context_sel).text(_moment.format('MMM'));
    $('.tap-year', context_sel).text(_moment.format('YYYY'));
  }

  $("#depart_picker").on("dp.change", function (e) {
    $('#date_select p.info span.dep').text(moment(e.date).format('ddd DD MMM'));
    setDisplayedDate($('.flight-date-info-item.sel.dep'), e.date);
    $('#return_picker').data("DateTimePicker").minDate(moment(e.date));
  });

  $("#return_picker").on("dp.change", function (e) {
    $('#date_select p.info span.ret').text(' - ' + moment(e.date).format('ddd DD MMM'));
    setDisplayedDate($('.flight-date-info-item.sel.ret'), e.date);
  });
  // }}} bind dp.change event

  // Tapable date elements {{{
  function changeDate(event) {
    var picker_id = '#'+ event.data.picker_id;
    var dest_date = $(picker_id).data("DateTimePicker").date();
    var cur_year = moment().year();

    if((event.data.date_key == 'y' || event.data.date_key == 'years') && cur_year != dest_date.year()) {
      dest_date.year(cur_year);
    }
    else {
      dest_date.add(1, event.data.date_key);
    }

    // Set new date in the datetimepicker. Also dp.change event will emits
    $(picker_id).data("DateTimePicker").date(dest_date);

    // Finalize dates choice
    finalizeValues(false);
  }

  $('.flight-date-info-item.sel.dep .tap-date').on('click', {picker_id:'depart_picker', date_key:'days'}, changeDate);
  $('.flight-date-info-item.sel.dep .tap-month').on('click', {picker_id:'depart_picker', date_key:'months'}, changeDate);

  $('.flight-date-info-item.sel.ret .tap-date').on('click', {picker_id:'return_picker', date_key:'days'}, changeDate);
  $('.flight-date-info-item.sel.ret .tap-month').on('click', {picker_id:'return_picker', date_key:'months'}, changeDate);
  // }}}} Tapable date elements

  // bind date controls click event
  $('.open-calendar').on('click', function () {
    heightNav = $('.navbar-header').outerHeight(true);
    $('.navbar-header').height('50px');
    $('#main_title').addClass('hidden');
    $('#main').addClass('hidden');
    $('#date_select').removeClass('hidden');
    $('#date_select_main').removeClass('hidden');
  });

  function finalizeValues(isModNavbar) {
    var moment_dp = $('#depart_picker').data("DateTimePicker").date();
    var moment_rp = $('#return_picker').data("DateTimePicker").date();
    var _isError = false;
    
    // cache values
    $('#departureDate').data('date', moment_dp.format('YYYY-MM-DD'));
    $('#returnDate').data('date', moment_rp.format('YYYY-MM-DD'));

    // Check depart date
    if(moment_dp && moment_dp.diff(moment(), 'days') >= searchApiMaxDays-1) {
      $('.flight-date-info-item.dep').addClass("error_elem");
      _isError = true;
    }
    else if($('.flight-date-info-item.dep').hasClass("error_elem")) {
      $('.flight-date-info-item.dep').removeClass("error_elem");
    }

    // Check return date
    if ($('.flight-type-item.active-choice').attr('id') == 'round_trip') {
      if(moment_rp && moment_rp.diff(moment(), 'days') >= searchApiMaxDays-1) {
        $('.flight-date-info-item.ret').addClass("error_elem");
        _isError = true;
      }
      else if($('.flight-date-info-item.ret').hasClass("error_elem")) {
        $('.flight-date-info-item.ret').removeClass("error_elem");
      }
    }

    if(isModNavbar) {
      $('.navbar-header').height(heightNav);
    }

    if(_isError) {
      $('.search-button').addClass('disabled');
    }
    else if($('.search-button').hasClass('disabled')) {
      $('.search-button').removeClass('disabled');
    }

    changeFlightTab($('#search_form').data('flight-type'));
  }

  $('#date_select_top').on('click', function () {
    $('#main_title').removeClass('hidden');
    $('#main').removeClass('hidden');
    $('#date_select').addClass('hidden');
    $('#date_select_main').addClass('hidden');

    finalizeValues(true);
  });
  /* }}} Depart/Return Date selection */

  function changeFlightTab(type) {
    $('#search_form').data('flight-type', type);
    $('#search_form #flightType').val(type);
    var hasFrom = !!$('#originAirport').val();
    var hasTo = !!$('#destinationAirport').val();
    switch (type) {
      case 'round_trip':
        $('.flight-direction-item-voice-search').addClass('hidden');
        $('.flight-direction-item').removeClass('hidden');
        $('.flight-direction-item-arrow').removeClass('hidden');
        if (hasFrom) {
          $('#from-area').addClass('hidden');
          $('#from-area-selected').removeClass('hidden');
        }
        if (hasTo) {
          $('#to-area').addClass('hidden');
          $('#to-area-selected').removeClass('hidden');
        }
        $('.flight-date-info').removeClass('hidden');
        if ($('#departureDate').data('date')) {
          $('#departureDate').val($('#departureDate').data('date'));
        }
        if (!!$('#departureDate').val()) {
          $('#departureDate').data('date', $('#departureDate').val());
          $('.flight-date-info-item.sel.dep').removeClass('hide');
          $('.flight-date-info-item.dep').not('.sel').addClass('hide');
        } else {
          $('.flight-date-info-item.sel.dep').addClass('hide');
          $('.flight-date-info-item.dep').not('.sel').removeClass('hide');
        }
        if ($('#returnDate').data('date')) {
          $('#returnDate').val($('#returnDate').data('date'));
        }
        if (!!$('#returnDate').val()) {
          $('#returnDate').data('date', $('#returnDate').val());
          $('.flight-date-info-item.sel.ret').removeClass('hide');
          $('.flight-date-info-item.ret').not('.sel').addClass('hide');
        } else {
          $('.flight-date-info-item.sel.ret').addClass('hide');
          $('.flight-date-info-item.ret').not('.sel').removeClass('hide');
        }
        $('#date_select_main .row.return').removeClass('hidden');
        $('#date_select p.header span.ret').removeClass('hidden');
        $('#date_select p.info span.ret').removeClass('hidden');
        $('.flight-additional-info').removeClass('hidden');
        $('.search-button').show();
        break;
      case 'voice_search':
        $('.flight-direction-item-voice-search').removeClass('hidden');
        $('.flight-direction-item').addClass('hidden');
        $('.flight-direction-item-arrow').removeClass('hidden');
        $('#from-area-selected').addClass('hidden');
        $('#to-area-selected').addClass('hidden');
        $('#from-area-selected').addClass('hidden');
        $('#to-area-selected').addClass('hidden');
        $('.flight-date-info').addClass('hidden');
        $('.flight-additional-info').addClass('hidden');
        $('.search-button').hide();
        break;
      case 'one_way':
        $('.flight-direction-item-voice-search').addClass('hidden');
        $('.flight-direction-item').removeClass('hidden');
        $('.flight-direction-item-arrow').removeClass('hidden');
        if (hasFrom) {
          $('#from-area').addClass('hidden');
          $('#from-area-selected').removeClass('hidden');
        }
        if (hasTo) {
          $('#to-area').addClass('hidden');
          $('#to-area-selected').removeClass('hidden');
        }
        $('.flight-date-info').removeClass('hidden');
        if ($('#departureDate').data('date')) {
          $('#departureDate').val($('#departureDate').data('date'));
        }
        if (!!$('#departureDate').val()) {
          $('.flight-date-info-item.sel.dep').removeClass('hide');
          $('.flight-date-info-item.dep').not('.sel').addClass('hide');
        } else {
          $('.flight-date-info-item.sel.dep').addClass('hide');
          $('.flight-date-info-item.dep').not('.sel').removeClass('hide');
        }
        $('#returnDate').val('');
        $('.flight-date-info-item.sel.ret').addClass('hide');
        $('.flight-date-info-item').not('.sel').eq(1).addClass('hide');
        $('#date_select_main .row.return').addClass('hidden');
        $('#date_select p.header span.ret').addClass('hidden');
        $('#date_select p.info span.ret').addClass('hidden');
        $('.flight-additional-info').removeClass('hidden');
        $('.search-button').show();
        break;
    }
  }


  $('.flight-type-item').on('click', function () {
    $('.flight-type-item').removeClass('active-choice');
    $(this).addClass('active-choice');
    var id = $(this).attr('id');
    changeFlightTab(id);
  });

  var setPassengersCount = function() {
    var currentValue = +$('#passengers').val();
    var digits = {1:"One", 2:"Two", 3:"Three", 4:"Four"};

    $('#passengers_count').text(digits[currentValue]);
    if ( currentValue > 1 ) {
      $('.passengers_text').text('Adults');
    } else {
      $('.passengers_text').text('Adult');
    }

  };

  $('.flight-passengers-info-item .text-picker').on('click', function () {
    var currentValue = +$('#passengers').val();
    if ( currentValue < 4 ) {
      $('#passengers').val(currentValue + 1);
    } else {
      $('#passengers').val(1);
    }

    setPassengersCount();
  });

  var setCabinClass = function() {
    if (typeof serviceClass != 'undefined') {
      $('.flight-class-info-item .text-picker').text(serviceClass[$('#preferedClass').val()]);
    }
  };

  $('.flight-class-info-item .text-picker').on('click', function () {

    var currentValue = $('#preferedClass').val();
    var flagNext = false;
    var newValue = 'E';

    for(var idx in serviceClass) {
      if (flagNext) {
        newValue = idx;
        break;
      }
      if (idx == currentValue) {
        flagNext = true;
      }
    }
    $('#preferedClass').val(newValue);

    setCabinClass();

  });

  $('.flight-direction-item,.flight-direction-item-selected').on('click', function () {
    heightNav = $('.navbar-header').outerHeight(true);
    $('.navbar-header').height('60px');
    $('#main_title').addClass('hidden');
    $('#main').addClass('hidden');
    $('#search_title').removeClass('hidden');
    $('#airport-input').focus();
    if ($(this).is('#from-area') || $(this).is('#from-area-selected')) {
      $('#airport-input').attr('target', 'originAirport');
    } else {
      $('#airport-input').attr('target', 'destinationAirport');
    }
  });

  $('#search_button_top').on('click', function () {
    $('#search_title').addClass('hidden');
    $('#main').removeClass('hidden');
    $('#main_title').removeClass('hidden');
    $('#airport-input').val('');
    $('#airport-input').typeahead('val','');
    $('.navbar-header').height(heightNav);
  });

  // search form init
  {
    // force dp.change event hook {{{
    $('#depart_picker').trigger({
      type: 'dp.change',
      date: $('#depart_picker').data("DateTimePicker").date(),
      oldDate: $('#depart_picker').data("DateTimePicker").date()
    });
    $('#return_picker').trigger({
      type: 'dp.change',
      date: $('#return_picker').data("DateTimePicker").date(),
      oldDate: $('#return_picker').data("DateTimePicker").date()
    });
    // }}} force dp.change event hook

    $('.flight-type-item').removeClass('active-choice');
    $('#' + $('#flightType').val()).addClass('active-choice');

    var choosenTab = $('.flight-type-item.active-choice').attr('id');
    changeFlightTab(choosenTab);
    drawAirportData('originAirport');
    drawAirportData('destinationAirport');
    setPassengersCount();
    setCabinClass();
  }

  // result page init
  {
    if ($('.flight-info').length) {
      $('.flight-info > div:first-child').css('padding-left', '0');
      $('button', '#main_title').prependTo('.flight-info > div:first-child').css('margin', '4px 0');
      $('#main_title > div.navbar-header').replaceWith($('.flight-info'));
      $('.flight-info').removeClass('hide').wrap('<div class="navbar-header"/>').wrap('<div class="container-fluid"/>');
      recalculateBodyPadding();
    }
    $('.list-group').slimScroll({
      height: '125px'
    });
  }

  $('#nav_slide_menu').offcanvas({
    toggle: false,
    placement: 'left'
  });

  var showMoreTiles = getCookie('tiles-scrolled');
  if (+showMoreTiles !== 1) {
    // start arrow blinking
    $('body').addClass('show-tiles-arrow');
    // hide arrow in 5 sec
    setTimeout(function(){$('body').removeClass('show-tiles-arrow');}, 5000);
  } else {
    $('body').removeClass('show-tiles-arrow');
  }

  recalculateBodyPadding();
});

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
