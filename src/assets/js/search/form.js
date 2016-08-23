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
      $('.from .plus').hide();
      $('.search-from').show();
      $('.flight-direction-item.from').addClass('sel');
      $('#from-airport-selected').text(airportCode);
      $('#from-city-selected').text(cityName);
      unsetErrorElement('#from-area');
    } else {
      $('.from .plus').show();
      $('.search-from').hide();
      $('.flight-direction-item.from').removeClass('sel');
      $('#from-airport-selected').text('');
      $('#from-city-selected').text('');
    }
  } else if (target == 'destinationAirport') {
    if (airportCode) {
      $('.to .plus').hide();
      $('.search-to').show();
      $('.flight-direction-item.to').addClass('sel');
      $('#to-airport-selected').text(airportCode);
      $('#to-city-selected').text(cityName);
      unsetErrorElement('#to-area');
    } else {
      $('.to .plus').show();
      $('.search-to').hide();
      $('.flight-direction-item.to').removeClass('sel');
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
    	
    	$('.form-fields').attr("class","form-fields round-trip");
      $('.flight-direction-item-voice-search').hide();
      
      
      // ------- depart date --------
      
      
      if ($('#departureDate').data('date')) {
        $('#departureDate').val($('#departureDate').data('date'));
      }
      
      // toggle date or "+"
      if (!!$('#departureDate').val()) {
      	$('#departureDate').data('date', $('#departureDate').val());
        $('.flight-date-info-item.dep .the-date').show();
        $('.flight-date-info-item.dep .tap-plus').hide();
      } else {
      	$('.flight-date-info-item.dep .the-date').hide();
        $('.flight-date-info-item.dep .tap-plus').show();
      }
      
      // ------- return date -------
      
      $('.flight-date-info-item.ret').show();
      
      if ($('#returnDate').data('date')) {
        $('#returnDate').val($('#returnDate').data('date'));
      }
      
      // toggle date or "+"
      if (!!$('#returnDate').val()) {
        $('#returnDate').data('date', $('#returnDate').val());
        $('.flight-date-info-item.ret .the-date').show();
        $('.flight-date-info-item.ret .weekday').show();
        $('.flight-date-info-item.ret .tap-plus').hide();
      } else {
      	$('.flight-date-info-item.ret .the-date').hide();
      	$('.flight-date-info-item.ret .weekday').hide();
        $('.flight-date-info-item.ret .tap-plus').show();
      }
      
      $('#date_select_main .row.return').show();
      $('#date_select p.header span.ret').show();
      $('#date_select p.info span.ret').show();
      $('.flight-additional-info').show();
      $('.search-buttons').show();

      $('.back-history').hide();
      $('.searchform-top').show();
      $('.navbar-brand').text('Avaea Agent');
      $('.navbar-toggle').show();
      $('.voice-form').hide();

      	
      break;
    case 'multi_city':
    	
    	$('.form-fields').attr("class","form-fields multi-city");
      $('.voice-form').hide();
     

      $('.back-history').hide();
      $('.searchform-top').show()
      $('.navbar-brand').text('Avaea Agent');
      $('.navbar-toggle').show();
      

      break;
    case 'voice_search':
    	
    	$('.form-fields').attr("class","form-fields voice-search");
    	
      $('.flight-direction-item-voice-search').show();
      $('.back-history').off('click').click(function () {
        $('#' + (prevTab ? prevTab : 'round_trip')).trigger('click');
      }).removeClass('hidden');

      $('.flight-direction-form').hide();
      $('.flight-date-info').hide();
      $('.flight-additional-info').hide();
      $('.searchform-top').hide();
      $('.main.container-fluid').addClass('voice-search');
      $('.flight-direction').addClass('voice-search');
      $('.navbar-brand').text('Voice Search');
      $('.navbar-toggle').hide();

      $('.search-buttons').hide();
      $('#voiceSearchTextarea').focus();
      
      break;
    case 'one_way':
    	
    	$('.form-fields').attr("class","form-fields one-way");
    	
      $('.flight-direction-item-voice-search').hide();
      
    	$('.flight-date-info-item.ret').hide();
    	$('#returnDate').val('');
      
 
      // ------- if dates are set --------
      
      if ($('#departureDate').data('date')) {
        $('#departureDate').val($('#departureDate').data('date'));
      }
      
      if (!!$('#departureDate').val()) {
        $('.flight-date-info-item.dep .the-date').show();
        $('.flight-date-info-item.dep .tap-plus').hide();
      } else {
      	$('.flight-date-info-item.dep .the-date').hide();
        $('.flight-date-info-item.dep .tap-plus').show();
      }
      
      $('.search-buttons').show();

      $('.back-history').hide();
      $('.searchform-top').show();
      $('.navbar-brand').text('Avaea Agent');
      $('.navbar-toggle').show();
      $('.voice-form').hide();

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

    $('.search-buttons').hide();
    $("body").addClass("loading");
    $('#planePath').removeClass('hidden');
    setInterval('fly("#plane")', 40);
    setCookie('dimmer_was_showed', 0);
    return true;
  });

  $('.flight-type-item').on('click', function () {
  	
  	// change the tabs
  	
	    var prevTab = $('.flight-type-item.active-choice').attr('id');
	    $('.flight-type-item').removeClass('active-choice');
	    $(this).addClass('active-choice');
	    var id = $(this).attr('id');
	    changeFlightTab(id, prevTab);
    
    // if "multi-city" is active, show "coming soon"
    
	    if ($(".flight-type-form .multi-city").hasClass("active-choice")) {
  			$('.multi-city-coming-soon').show();
		  } else {
		  	$('.multi-city-coming-soon').hide();
		  } 
	    	
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
