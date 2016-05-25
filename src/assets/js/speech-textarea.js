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
  var oldPlaceholder = 'Press the button and dictate a flight request';

  if (!('webkitSpeechRecognition' in window)) {
    notSupported();
  } else {

    var talkMsg = 'Start Talking';
    var patience = 6;
    var speechInputWrappers = document.getElementsByClassName('si-wrapper');

    [].forEach.call(speechInputWrappers, function(speechInputWrapper) {
      // find elements
      var inputEl = speechInputWrapper.querySelector('.si-input');
      var micBtn = speechInputWrapper.querySelector('.si-btn');

      // setup recognition
      var finalTranscript = '';
      var recognizing = false;
      var timeout;
      var recognition = new webkitSpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = true;
      //recognition.interimResults = true;

      function restartTimer() {
        timeout = setTimeout(function() {
          recognition.stop();
        }, patience * 1000);
      }

      recognition.onerror = function (event) {
        log(event);
        if (event.error == 'no-speech') {
          start_button.removeClass('listening').toggleClass('fa-microphone fa-pause');
          log('info_no_speech');
          ignore_onend = true;
        }
        if (event.error == 'audio-capture') {
          start_button.removeClass('listening').toggleClass('fa-microphone fa-pause');
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

      recognition.onstart = function() {
        oldPlaceholder = inputEl.placeholder;
        //inputEl.placeholder = talkMsg;
        recognizing = true;
        micBtn.classList.add('listening');
        restartTimer();
      };

      recognition.onend = function() {
        recognizing = false;
        clearTimeout(timeout);
        start_button.removeClass('listening').toggleClass('fa-microphone fa-pause');
        //micBtn.classList.remove('listening');
        if (oldPlaceholder !== null) inputEl.placeholder = oldPlaceholder;
      };

      recognition.onresult = function(event) {
        clearTimeout(timeout);
        if (typeof(event.results) == 'undefined') {
          recognition.onend = null;
          recognition.stop();
          upgrade();
          return;
        }

        for (var i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        finalTranscript = capitalize(finalTranscript);
        log(finalTranscript);
        inputEl.innerHTML = finalTranscript;
        restartTimer();
        if (finalTranscript) {
          showButtons(false);
        } else {
          inputEl.innerHTML = oldPlaceholder;
        }
        start_button.removeClass('listening fa-microphone fa-pause').addClass('fa-repeat');
      };

      micBtn.addEventListener('click', function(event) {
        event.preventDefault();
        if (recognizing) {
          recognition.stop();
          return;
        }

        clearVoiceSearch();
        final_transcript = '';
        ignore_onend = false;
        start_button.toggleClass('fa-microphone fa-pause');
        log('info_allow');
        showButtons(true);
        start_timestamp = event.timeStamp;
        inputEl.innerHTML = finalTranscript = '';
        recognition.start();
      }, false);
    });
  }


  var clearVoiceSearch = function () {
    if ($(this).hasClass('disabled')) return;

    final_textarea.innerHTML = oldPlaceholder;
    final_transcript = '';
    recognizing = false;

    $('#airport-input').val('');
    $('#airport-input').typeahead('val','');

    $('#originAirport, #destinationAirport').val('');

    $('#departureDate').data('date', moment());
    var pickerDepart = $('#depart_picker').data('DateTimePicker');
    pickerDepart.date(moment());

    $('#returnDate').data('date', '').val('');

    $('#passengers').val(1);
    $('.passengers_count').text(digits[1]);

    $('#preferedClass').val('E');
    $('.flight-class-info-item .text-picker').text(serviceClass['E']);
  };

  $('#voiceSearchFlight').click(function () {
    if ($(this).hasClass('disabled')) return;

    demo();
    if (roundTrip) {
      $('#round_trip').trigger('click');
    } else {
      $('#one_way').trigger('click');
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
      $('.voice-search-buttons').addClass('hidden');
      $('#voiceSearchFlight').addClass('disabled');
    } else {

      $('#voiceSearchFlight').removeClass('disabled hidden');
    }
  }

  /**
   * I would like to fly from San Francisco to London on 29th
   * I would like to fly from San Francisco to Kiev on 30th the first class with my son return on July 30th
   */
  function demo() {
    log(final_textarea.html());
    var text = $.trim(final_textarea.html());
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