/* global $ */

var fly = function (target) {
  var pos = $(target).position();
  var speed = 1;
  if ($('body').outerWidth() < pos.left+speed) {
    pos.left = -50;
  }
  $(target).css('left', pos.left+speed);
};

var setAirportData = function(target, data) {
  $('#' + target).val(data.value);
  $('#' + target).attr('city', data.city);
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
      unsetErrorElement('#from-area');
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
      unsetErrorElement('#to-area');
    } else {
      $('#to-area-selected').addClass('hidden');
      $('#to-area').removeClass('hidden');
      $('#to-airport-selected').text('');
      $('#to-city-selected').text('');
    }
  }
};


// Vars
var flashErrorTimeout = 1000;

// For elements with error
var setErrorElement = function (selector) {
  // Logic and animation
  $(selector).addClass('error-elem error-flash');
  // Animation
  setTimeout(function() {
    $(selector).removeClass('error-flash');
  }, flashErrorTimeout);
};
var unsetErrorElement = function (selector) {
  if($(selector).hasClass("error-elem")) {
    $(selector).removeClass("error-elem");
  }
};

var setupVoiceSearch = function () {
  if($('#result_empty').text()) {
    $('#voice_search').hide();
  }
};

function changeFlightTab(type, prevTab) {
  $('#search_form').data('flight-type', type);
  $('#search_form #flightType').val(type);
  var hasFrom = !!$('#originAirport').val();
  var hasTo = !!$('#destinationAirport').val();
  switch (type) {
    case 'round_trip':
      $('.flight-direction-item-voice-search').addClass('hidden');
      $('.flight-direction-item-coming-soon').addClass('hidden');
      $('.flight-direction-item').removeClass('hidden');
      $('.flight-direction-item-arrow').removeClass('hidden');
      $('.flight-direction-form').removeClass('hidden');
      
      // ------- if from-to are set --------
      
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
      
      // ------- if dates are set --------
      
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
      $('.search-top-button').show();

      $('.back-history').addClass('hidden');
      $('.searchform-top').removeClass('hidden');
      $('.container-fluid').addClass('noValue');
      $('.flight-direction').addClass('noValue');
      $('.navbar-brand').text('Avaea Agent');
      $('.navbar-toggle').removeClass('hidden');
      $('.voice-search-buttons').addClass('hidden');
      $('#voiceSearchFlight').addClass('disabled');

      break;
    case 'multi_city':
      $('.flight-direction-item-coming-soon').removeClass('hidden');
      $('.flight-direction-item-voice-search').addClass('hidden');
      $('.flight-direction-item').addClass('hidden');
      $('.flight-direction-item-arrow').removeClass('hidden');
      $('.flight-direction-form').removeClass('hidden');
      $('#from-area-selected').addClass('hidden');
      $('#to-area-selected').addClass('hidden');
      $('#from-area-selected').addClass('hidden');
      $('#to-area-selected').addClass('hidden');
      $('.flight-date-info').addClass('hidden');
      $('.flight-additional-info').addClass('hidden');
      $('.search-button').hide();
      $('.search-top-button').hide();

      $('.back-history').addClass('hidden');
      $('.searchform-top').removeClass('hidden');
      $('.container-fluid').addClass('noValue');
      $('.flight-direction').addClass('noValue');
      $('.navbar-brand').text('Avaea Agent');
      $('.navbar-toggle').removeClass('hidden');
      $('.voice-search-buttons').addClass('hidden');
      $('#voiceSearchFlight').addClass('disabled');

      break;
    case 'voice_search':
      $('.flight-direction-item-voice-search').removeClass('hidden');
      $('.flight-direction-item-arrow').removeClass('hidden');
      $('.back-history').off('click').click(function () {
        $('#' + (prevTab ? prevTab : 'round_trip')).trigger('click');
      }).removeClass('hidden');

      $('.flight-direction-item-coming-soon').addClass('hidden');
      $('.flight-direction-form').addClass('hidden');
      $('.flight-date-info').addClass('hidden');
      $('.flight-additional-info').addClass('hidden');
      $('.searchform-top').addClass('hidden');
      $('.main.container-fluid').addClass('voice-search');
      $('.flight-direction').addClass('voice-search');
      $('.navbar-brand').text('Voice Search');
      $('.navbar-toggle').addClass('hidden');

      $('.search-button').hide();
      $('.search-top-button').hide();
      $('#voiceSearchTextarea').focus();
      
      break;
    case 'one_way':
      $('.flight-direction-item-voice-search').addClass('hidden');
      $('.flight-direction-item-coming-soon').addClass('hidden');
      $('.flight-direction-item').removeClass('hidden');
      $('.flight-direction-item-arrow').removeClass('hidden');
      $('.flight-direction-form').removeClass('hidden');
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
      $('.search-top-button').show();

      $('.back-history').addClass('hidden');
      $('.searchform-top').removeClass('hidden');
      $('.container-fluid').addClass('noValue');
      $('.flight-direction').addClass('noValue');
      $('.navbar-brand').text('Avaea Agent');
      $('.navbar-toggle').removeClass('hidden');
      $('.voice-search-buttons').addClass('hidden');
      $('#voiceSearchFlight').addClass('disabled');

      break;
  }
  // force dp.change event hook {{{
  $('#dr_picker').data("DateTimePicker").clear();
  var depDate = $('#departureDate').val() ? moment($('#departureDate').val(), 'YYYY-MM-DD') : moment();
  $('#dr_picker').data("DateTimePicker").date(depDate);
  if (type == 'round_trip') {
    var retDate = $('#returnDate').val() ? moment($('#returnDate').val(), 'YYYY-MM-DD') : depDate.clone().add(14, 'days');
    if (retDate.isAfter($('#dr_picker').data("DateTimePicker").maxDate())) {
      retDate = $('#dr_picker').data("DateTimePicker").maxDate().clone();
    }
    $('#dr_picker').trigger({
      type: 'dp.change',
      date: retDate,
      oldDate: depDate
    });
  }
  // }}} force dp.change event hook

}

var setCabinClass = function() {
  if (typeof serviceClass != 'undefined') {
    $('.flight-class-info-item .text-picker').text(serviceClass[$('#preferedClass').val()]);
  }
};

$(document).ready(function() {

  // search form init
  {
    $('.flight-type-item').removeClass('active-choice');
    $('#' + $('#flightType').val()).addClass('active-choice');

    var flightType = $('.flight-type-item.active-choice').attr('id');
    var _ft = getCookie('flightType');
    if (_ft) {
      // remove flightType cookie
      setCookie('flightType', '', {expires: 'Thu, 01 Jan 1970 00:00:01 GMT'});
      $('#' + _ft).addClass('active-choice');
      changeFlightTab(_ft, flightType);
    } else {
      changeFlightTab(flightType);
    }
    drawAirportData('originAirport');
    drawAirportData('destinationAirport');
    renderPassengerChooser($('#passengers').val());
    setCabinClass();
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
      setErrorElement('#from-area');
      _isError = true;
    }
    if ($('#destinationAirport').val() == '') {
      setErrorElement('#to-area');
      _isError = true;
    }
    if ($('#originAirport').val() == $('#destinationAirport').val()) {
      setErrorElement('#from-area');
      setErrorElement('#from-area-selected');
      setErrorElement('#to-area');
      setErrorElement('#to-area-selected');
      _isError = true;
    }

    // Check existence of the return date for the round trip
    if ($('#returnDate').val() == '' && $('.flight-type-item.active-choice').attr('id') == 'round_trip') {
      setErrorElement('.flight-date-info-item.ret');
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
    setCookie('dimmer_was_showed', 0);
    return true;
  });

  $('.flight-type-item').on('click', function () {
    var prevTab = $('.flight-type-item.active-choice').attr('id');
    $('.flight-type-item').removeClass('active-choice');
    $(this).addClass('active-choice');
    var id = $(this).attr('id');
    changeFlightTab(id, prevTab);
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

    setCabinClass();

  });


});
