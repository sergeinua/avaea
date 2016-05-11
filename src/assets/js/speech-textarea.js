(function () {
  'use strict';
  var final_transcript = '';
  var recognizing = false;
  var ignore_onend;
  var start_timestamp;
  var start_button = $('#start_button');
  var final_textarea = $('#voiceSearchTextarea');
  var roundTrip = false;
  var digits = {1:"One", 2:"Two", 3:"Three", 4:"Four"};

  if (!('webkitSpeechRecognition' in window)) {
    notSupported();
  } else {
    final_textarea.keyup(function () {
      var _value = $.trim($(this).val());
      if (_value != '' && _value.length > 0) {
        showButtons(false);
      }
    });

    start_button.click(function (e) {
      startButton(e);
    }).show();

    $('#voiceClearFlight').click(function () {
      if ($(this).hasClass('disabled')) return;

      final_textarea.val('');
      final_transcript = '';
      recognizing = false;

      $('#airport-input').val('');
      $('#airport-input').typeahead('val','');

      $('#originAirport, #destinationAirport').val('');
      //$('#from-airport-selected').empty();
      //$('#from-city-selected').empty();

      $('#departureDate').data('date', moment());
      var pickerDepart = $('#depart_picker').data('DateTimePicker');
      pickerDepart.date(moment());

      $('#returnDate').data('date', '').val('');
      //var pickerReturn = $('#return_picker').data('DateTimePicker');
      //pickerReturn.date(dates[1].getFullYear() + '-' +	_month + '-' + _day);

      $('#passengers').val(1);
      $('.passengers_count').text(digits[1]);

      $('#preferedClass').val('E');
      $('.flight-class-info-item .text-picker').text(serviceClass['E']);
    });

    $('#voiceSearchFlight').click(function () {
      if ($(this).hasClass('disabled')) return;

      demo();
      if (roundTrip) {
        $('#round_trip').trigger('click');
      } else {
        $('#one_way').trigger('click');
      }
    });

    $('#checkSearchFlight').click(function () {
      if ($(this).hasClass('disabled')) return;

      demo();

      // Check airports selection
      if($('#originAirport').val() == '') {
        $('#from-area').addClass("error_elem");
      }
      if($('#destinationAirport').val() == '') {
        $('#to-area').addClass("error_elem");
      }

      // Check existence of the return date for the round trip
      if($('#returnDate').val() == '' && $('.flight-type-item.active-choice').attr('id') == 'round_trip') {
        $('.flight-date-info-item.ret').addClass("error_elem");
      }
    });

    var drawAirportData = function (target) {
      var cityName = $('#' + target).attr('city');
      var nearleftCode = $('#' + target).attr('nearleft');
      var nearrightCode = $('#' + target).attr('nearright');
      var airportCode = $('#' + target).val();
      if (target == 'originAirport') {
        if (airportCode) {
          $('#from-airport-selected').text(airportCode);
          $('#from-city-selected').text(cityName);
          $('#from-airport-nearleft').text(nearleftCode);
          $('#from-airport-nearright').text(nearrightCode);
          if($('#from-area').hasClass("error_elem")) {
            $('#from-area').removeClass("error_elem");
          }
        } else {
          $('#from-airport-selected').text('');
          $('#from-city-selected').text('');
        }
      } else if (target == 'destinationAirport') {
        if (airportCode) {
          $('#to-airport-selected').text(airportCode);
          $('#to-city-selected').text(cityName);
          $('#to-airport-nearleft').text(nearleftCode);
          $('#to-airport-nearright').text(nearrightCode);
          if($('#to-area').hasClass("error_elem")) {
            $('#to-area').removeClass("error_elem");
          }
        } else {
          $('#to-airport-selected').text('');
          $('#to-city-selected').text('');
        }
      }
    };
    var setAirportData = function(target, data) {
      $('#' + target).val(data.value);
      $('#' + target).attr('city', data.city);
      $('#' + target).attr('nearleft', data.neighbors[0].iata_3code);
      $('#' + target).attr('nearright', data.neighbors[1].iata_3code);
    };

    $('#airport-input').bind('typeahead:render', function (ev, item) {
      if (item && item.value) {
        setAirportData($(this).attr('target'), item);
        drawAirportData($(this).attr('target'));
      }
    });

    var recognition = new webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = function () {
      recognizing = true;
      log('info_speak_now');
      start_button.addClass('listening');
    };

    recognition.onerror = function (event) {
      if (event.error == 'no-speech') {
        start_button.removeClass('listening').toggleClass('fa-microphone fa-microphone-slash');
        log('info_no_speech');
        ignore_onend = true;
      }
      if (event.error == 'audio-capture') {
        start_button.removeClass('listening').toggleClass('fa-microphone fa-microphone-slash');
        log('info_no_microphone');
        ignore_onend = true;
      }
      if (event.error == 'not-allowed') {
        if (event.timeStamp - start_timestamp < 100) {
          log('info_blocked');
        } else {
          log('info_denied');
        }
        ignore_onend = true;
      }
    };

    recognition.onend = function () {
      recognizing = false;
      if (ignore_onend) {
        return;
      }
      start_button.removeClass('listening').toggleClass('fa-microphone fa-microphone-slash');
      if (!final_transcript) {
        log('info_start');
        return;
      }
      log('End speech');
      //if (window.getSelection) {
      //  window.getSelection().removeAllRanges();
      //  var range = document.createRange();
      //  range.selectNode(document.getElementById('voiceSearchTextarea'));
      //  window.getSelection().addRange(range);
      //}
    };

    recognition.onresult = function (event) {
      var interim_transcript = '';
      if (typeof(event.results) == 'undefined') {
        recognition.onend = null;
        recognition.stop();
        upgrade();
        return;
      }
      for (var i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final_transcript += event.results[i][0].transcript;
        } else {
          interim_transcript += event.results[i][0].transcript;
        }
      }

      final_transcript = capitalize(final_transcript);
      log(final_transcript);
      final_textarea.empty().val(final_transcript);
      if (final_transcript || interim_transcript) {
        showButtons(false);
      }
    };
  }

  function notSupported() {
    log('Web Speech API is not supported by this browser.');

    upgrade();
  }

  function upgrade() {
    start_button.hide();
    log('info_upgrade');
  }

  var first_char = /\S/;
  function capitalize(s) {
    return s.replace(first_char, function (m) {
      return m.toUpperCase();
    });
  }

  function startButton(event) {
    if (recognizing) {
      recognition.stop();
      return;
    }
    final_transcript = '';
    recognition.start();
    ignore_onend = false;
    final_textarea.val('');
    start_button.toggleClass('fa-microphone fa-microphone-slash');
    log('info_allow');
    showButtons(true);
    start_timestamp = event.timeStamp;
  }

  function log() {
    if (typeof console !== 'undefined') {
      console.log.apply(console, arguments);
    }
  }

  var current_disable;
  function showButtons(disable) {
    if (disable == current_disable) {
      return;
    }
    current_disable = disable;
    if (disable) {
      $('#voiceClearFlight, #voiceSearchFlight, #checkSearchFlight').addClass('disabled');
    } else {
      $('#voiceClearFlight, #voiceSearchFlight, #checkSearchFlight').removeClass('disabled');
    }
  }

  /**
   * I would like to fly from San Francisco to London on 29th
   * I would like to fly from San Francisco to Kiev on 30th the first class with my son return on July 30th
   */
  function demo() {
    log(final_textarea.val());
    var text = $.trim(final_textarea.val());
    text = text.replace(/\bone|fir(?= st)/ig,"1");
    text = text.replace(/\btwo|seco(?= nd)/ig,"2");
    text = text.replace(/\bthree|thi(?= rd)/ig,"3");
    text = text.replace(/\bfour/ig,"4");
    text = text.replace(/\bfive/ig,"5");
    text = text.replace(/\bsix/ig,"6");
    var out_field = '';

    if (/Fly me to the moon/i.exec(text)) {
      out_field = "Meri says: Fill my heart with song and \n"
      + "Let me sing for ever more You are all I long for \n"
      + "All I worship and adore";
      return;
    }
    out_field += "Meri says: ";

    var cities = speechSearchParse.parseCities(text);
    if (cities && (cities[0] || cities[1])) {
      if (cities[0]) {
        $('#airport-input').attr('target', 'originAirport');
        $('#airport-input').typeahead('val', cities[0]);
        //$('#originAirport').typeahead('val', cities[0]);
      } else cities[0] = "an unknown airport";
      if (cities[1]) {
        $('#airport-input').attr('target', 'destinationAirport');
        $('#airport-input').typeahead('val', cities[1]);
        //$('#destinationAirport').typeahead('val', cities[1]);
      } else cities[1] = "an unknown airport";
      out_field += " here is what I understood -"
      + " The trip is from " + cities[0] + " to " + cities[1];
    } else {
      out_field += " I did not understand where you are flying to.";
      return;
    }

    var dates = speechSearchParse.parseDates(text);
    log(dates);
    if (dates) {
      var leaving = "an unknown date", returning;
      if (dates[0]) {
        var _month = dates[0].getMonth() + 1,
          _day = dates[0].getDate();
        if (_month < 10) _month = '0' + _month;
        if (_day < 10) _day = '0' + _day;
        $('#departureDate').data('date', dates[0].getFullYear() + '-' +	_month + '-' + _day);
        var picker = $('#depart_picker').data('DateTimePicker');
        picker.date(dates[0].getFullYear() + '-' +	_month + '-' + _day);

        leaving = dates[0].toDateString();
        //$('input[name=departureDate]', '.voiceSearch').val(leaving);
        roundTrip = false;
      }
      if (dates[1]) {
        var _month = dates[1].getMonth() + 1,
          _day = dates[1].getDate();
        if (_month < 10) _month = '0' + _month;
        if (_day < 10) _day = '0' + _day;
        $('#returnDate').data('date', dates[1].getFullYear() + '-' + _month + '-' + _day);
        var picker = $('#return_picker').data('DateTimePicker');
        picker.date(dates[1].getFullYear() + '-' +	_month + '-' + _day);

        returning = dates[1].toDateString();
        //$('input[name=returnDate]', '.voiceSearch').val(returning);
        roundTrip = true;
      }

      $('#date_select_top').trigger('click');

      out_field += ", leaving on " + leaving + " "	+ (returning ? " returning on " + returning + " " : ".");
    } else {
      out_field += " I did not find dates in your request. ";
      roundTrip = false;
      return;
    }

    var num = speechSearchParse.parseNumTix(text);
    var cls = speechSearchParse.parseClass(text);

    if (cls) {
      $('input[name=preferedClass]').each(function (i, o) {
        var _txt = $(o).parents('label').text();
        if (_txt.toLowerCase().indexOf(cls.toLowerCase()) != -1) {
          $(o).prop('checked', true);
          $(o).parents('label').trigger('click');
        }
      });
    }

    if (num && (num > 0 || num == "multiple")) {
      out_field += " You need " + num
      + (num == 1 ? " ticket" : " tickets") + " "
      + (cls ? " in " + cls + " class " : "") + ". \n";
      if (num == "multiple") {
        num = 4;
      }

      if (digits[num]) {
        $('#passengers').val(num);
        $('.passengers_count').text(digits[num]);
      }
    }

    if (cls) {
      out_field += " You are travelling in " + cls + " class.";
      if (serviceClass && serviceClass[cls]) {
        $('#preferedClass').val(cls);
        $('.flight-class-info-item .text-picker').text(serviceClass[cls]);
      }
    }

    speechSearchParse.log(out_field);
  }
})();