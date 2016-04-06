/* global $ */
$(document).ready(function() {


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
    //$('#airport-input').typeahead('setQuery', '');
    drawAirportData($(this).attr('target'));
  });
  $('.tt-hint').addClass('form-control');

  //loading
  $('#search_form').submit(function (event) {
    var _isError = false;

    // Check airports selection
    if($('#originAirport').val() == '') {
      $('#from-area').addClass("error_elem");
      _isError = true;
    }
    if($('#destinationAirport').val() == '') {
      $('#to-area').addClass("error_elem");
      _isError = true;
    }

    // Check existence of the return date for the round trip
    if($('#returnDate').val() == '' && $('.flight-type-item.active-choice').attr('id') == 'round_trip') {
      $('.flight-date-info-item.ret').addClass("error_elem");
      _isError = true;
    }

    if(_isError)
      return false;

    $('.search-button').hide();
    $("body").addClass("loading");
    return true;
  });


  function changeFlightTab(type) {
    $('#search_form').data('flight-type', type);
    var hasFrom = !!$('#originAirport').val();
    var hasTo = !!$('#destinationAirport').val();
    switch (type) {
      case 'round_trip':
        $('.flight-direction-item-coming-soon').addClass('hidden');
        $('.flight-direction-item').removeClass('hidden');
        $('.flight-direction-item-arrow').removeClass('hidden');
        $('.flight-direction-item-arrow').html('&#8596;');
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
        break;
      case 'multi_city':
        $('.flight-direction-item-coming-soon').removeClass('hidden');
        $('.flight-direction-item').addClass('hidden');
        $('.flight-direction-item-arrow').addClass('hidden');
        $('#from-area-selected').addClass('hidden');
        $('#to-area-selected').addClass('hidden');
        $('#from-area-selected').addClass('hidden');
        $('#to-area-selected').addClass('hidden');
        $('.flight-date-info').addClass('hidden');
        $('.flight-additional-info').addClass('hidden');
        break;
      case 'one_way':
        $('.flight-direction-item-coming-soon').addClass('hidden');
        $('.flight-direction-item').removeClass('hidden');
        $('.flight-direction-item-arrow').removeClass('hidden');
        $('.flight-direction-item-arrow').html('&rarr;');
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
        break;
    }
  }


  $('.flight-type-item').on('click', function () {
    $('.flight-type-item').removeClass('active-choice');
    $(this).addClass('active-choice');
    var id = $(this).attr('id');
    changeFlightTab(id);
  });

  $('.flight-passengers-info-item .text-picker, #user-icon-small').on('click', function () {
    var currentValue = $('#passengers').val();

    if ( currentValue < 3 ) {
      currentValue++;
      $('.passengers_text').text('Adults');
    } else {
      currentValue = 1;
      $('.passengers_text').text('Adult');
    }
    $('#passengers').val(currentValue);
    $('.passengers_count').text(currentValue);
  });

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
    $(this).text(serviceClass[newValue]);
  });

  $('.flight-direction-item,.flight-direction-item-selected').on('click', function () {
    $('#main_title').addClass('hidden');
    $('#main').addClass('hidden');
    $('#search_title').removeClass('hidden');
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

    var choosenTab = $('.flight-type-item.active-choice').attr('id');
    changeFlightTab(choosenTab);
    drawAirportData('originAirport');
    drawAirportData('destinationAirport');
  }

});