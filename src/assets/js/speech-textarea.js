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
    start_button.click(function (e) {
      startButton(e);
    }).show();

    var isMobileDev = navigator.userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile/i);
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
        start_button.removeClass('listening').toggleClass('fa-microphone fa-stop');
        log('info_no_speech');
        ignore_onend = true;
      }
      if (event.error == 'audio-capture') {
        start_button.removeClass('listening').toggleClass('fa-microphone fa-stop');
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
      start_button.removeClass('listening').toggleClass('fa-microphone fa-stop');
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
          if (isMobileDev) {
            final_transcript = event.results[i][0].transcript;
          } else {
            final_transcript += event.results[i][0].transcript;
          }
        } else {
          if (isMobileDev) {
            interim_transcript = event.results[i][0].transcript;
          } else {
            interim_transcript += event.results[i][0].transcript;
          }
        }
      }

      final_transcript = capitalize(final_transcript);
      log(final_transcript);
      if (final_textarea) final_textarea.empty().val(final_transcript);
      if (interim_transcript) final_textarea.val(capitalize(interim_transcript));
      if (final_transcript || interim_transcript) {
        showButtons(false);
      }
    };

  }


  final_textarea.keyup(function () {
    var _value = $.trim($(this).val());
    if (_value != '' && _value.length > 0) {
      showButtons(false);
    } else {
      showButtons(true);
    }
  }).focus(function () {
    start_button.addClass('hidden');
    var _value = $.trim(final_textarea.val());
    if (_value != '' && _value.length > 0) {
      showButtons(false);
    }
  }).blur(function () {
    start_button.removeClass('hidden');
  });

  var clearVoiceSearch = function () {
    if ($(this).hasClass('disabled')) return;

    final_textarea.val('');
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
    var heightNav = $('.navbar-header').outerHeight(true);
    demo();

    if (roundTrip) {
      $('#round_trip').trigger('click');
    } else {
      $('#one_way').trigger('click');
    }
    $('.navbar-header').css('height', heightNav);
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

  function startButton(event) {
    if (recognizing) {
      recognition.stop();
      return;
    }
    final_transcript = '';
    recognition.start();
    ignore_onend = false;
    final_textarea.val('');
    start_button.toggleClass('fa-microphone fa-stop');
    log('info_allow');
    showButtons(true);
    start_timestamp = event.timeStamp;
  }

  function log() {
    if (typeof console !== 'undefined') {
      console.log.apply(console, arguments);
    }
  }

  function showButtons(disable) {
    if (disable) {
      $('.voice-search-buttons').addClass('hidden');
      $('#voiceSearchFlight').addClass('disabled');
    } else {
      $('.voice-search-buttons').removeClass('hidden');
      $('#voiceSearchFlight').removeClass('disabled');
      $('#voiceSearchFlight').removeClass('hidden');
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
        $.ajax({
          url: '/ac/airports',
          type: 'get',
          data: {q: $.trim(cities[0]), l: 1},
          dataType: 'json'
        }).done(function( msg ) {
          setAirportData('originAirport', msg[0]);
          drawAirportData('originAirport');
        });
      } else cities[0] = "an unknown airport";
      if (cities[1]) {
        $.ajax({
          url: '/ac/airports',
          type: 'get',
          data: {q: $.trim(cities[1]), l: 1},
          dataType: 'json'
        }).done(function( msg ) {
          setAirportData('destinationAirport', msg[0]);
          drawAirportData('destinationAirport');
        });
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
