(function () {
  'use strict';
  var final_transcript = '';
  var recognizing = false;
  var ignore_onend;
  var start_timestamp;
  var start_button = $('#start_button');
  var final_textarea = $('#voiceSearchTextarea');
  var clear_button = $('#clear_button');
  var digits = {1:"One", 2:"Two", 3:"Three", 4:"Four"};
  var isMobileDev = navigator.userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile/i);

  if (!('webkitSpeechRecognition' in window)) {
    notSupported();
  } else {
    start_button.click(function (e) {
      startButton(e);
    }).show();

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

    clear_button.click(function (e) {
      recognition.stop();
      final_textarea.val('');
      final_textarea.focus();
    });
  }


  final_textarea.keyup(function () {
    var _value = $.trim($(this).val());
    if (_value != '' && _value.length > 0 && cntWords(_value)) {
      showButtons(false);
    } else {
      showButtons(true);
    }
  }).focus(function () {
    start_button.addClass('hidden');
    var _value = $.trim(final_textarea.val());
    if (_value != '' && _value.length > 0 && cntWords(_value)) {
      showButtons(false);
    }
  }).blur(function () {
    if (!isMobileDev) start_button.removeClass('hidden').css('display', '');
    var _value = $.trim(final_textarea.val());
    if (_value != '' && _value.length > 0 && cntWords(_value)) {
      showButtons(false);
    }
  });

  var cntWords = function (val) {
    var words = val.split(' ');
    return (words.length >= 4);
  };

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
    if (recognition && recognizing) {
      recognition.stop();
    }
    var heightNav = $('.navbar-header').outerHeight(true);
    var res = demo();
    loggerQuery($.trim(final_textarea.val()), (res ? 'success' : 'failed'));

    $('.navbar-header').css('height', heightNav);
  });

  function notSupported() {
    log('Web Speech API is not supported by this browser.');
    if (!isMobileDev) {
      final_textarea.attr('placeholder', 'Web Speech API is not supported by this browser.');
    }
    upgrade();
  }

  function upgrade() {
    start_button.addClass('hidden');
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
    } else if (!$('.flight-direction-item-voice-search').hasClass('hidden')) {
      $('.voice-search-buttons').removeClass('hidden');
      $('#voiceSearchFlight').removeClass('disabled');
    }
  }

  function loggerQuery(q, result) {
    $.ajax({
      url: '/search/voiceLog',
      type: 'post',
      data: {
        q: $.trim(q),
        result: result
      },
      dataType: 'json'
    }).done(function( msg ) {
      console.log(msg);
    });
  }

  /**
   * I would like to fly from San Francisco to London on 29th
   * I would like to fly from San Francisco to Kiev on 30th the first class with my son return on July 30th
   * I need 2 tickets from San Jose to Moscow on July 10th returning two weeks later
   */
  function demo() {
    log(final_textarea.val());
    var text = $.trim(final_textarea.val());
    var out_field = '';
    var result  = {};

    var parser = new AvaeaTextParser();
    parser.run(text);
    result.origin_airport      = parser.origin_airport    ? parser.origin_airport.value : undefined;
    result.destination_airport = parser.return_airport    ? parser.return_airport.value : undefined;
    result.origin_date         = parser.origin_date       ? parser.origin_date.value : false;
    result.return_date         = parser.return_date       ? parser.return_date.value : false;
    result.type                = parser.type;
    result.number_of_tickets   = parser.number_of_tickets ? parser.number_of_tickets.value : undefined;
    result.class_of_service    = parser.class_of_service  ? parser.class_of_service.value : undefined;

    if (/Fly me to the moon/i.exec(text)) {
      out_field = "Meri says: Fill my heart with song and \n"
      + "Let me sing for ever more You are all I long for \n"
      + "All I worship and adore";
      return false;
    }
    out_field += "Meri says: ";

    if (result.origin_airport || result.destination_airport) {
      if (result.origin_airport) {
        $.ajax({
          url: '/ac/airports',
          type: 'get',
          data: {q: $.trim(result.origin_airport), l: 1},
          dataType: 'json'
        }).done(function( msg ) {
          if (msg && msg.length) {
            setAirportData('originAirport', msg[0]);
            drawAirportData('originAirport');
          }
        });
      } else result.origin_airport = "an unknown airport";
      if (result.destination_airport) {
        $.ajax({
          url: '/ac/airports',
          type: 'get',
          data: {q: $.trim(result.destination_airport), l: 1},
          dataType: 'json'
        }).done(function( msg ) {
          if (msg && msg.length) {
            setAirportData('destinationAirport', msg[0]);
            drawAirportData('destinationAirport');
          }
        });
      } else result.destination_airport = "an unknown airport";
      out_field += " here is what I understood -"
      + " The trip is from " + result.origin_airport + " to " + result.destination_airport;
    } else {
      out_field += " I did not understand where you are flying to.";
      return false;
    }

    if (result.type == 'round_trip') {
      $('#round_trip').trigger('click');
    }
    if (result.type == 'one_way') {
      $('#one_way').trigger('click');
    }

    if (result.origin_date || result.return_date) {
      var leaving = "an unknown date", returning;
      if (result.origin_date) {
        var _month = result.origin_date.getMonth() + 1,
          _day = result.origin_date.getDate();
        if (_month < 10) _month = '0' + _month;
        if (_day < 10) _day = '0' + _day;
        $('#departureDate').data('date', result.origin_date.getFullYear() + '-' + _month + '-' + _day);
        var picker = $('#dr_picker').data('DateTimePicker');
        picker.clear();
        picker.date(result.origin_date);
        leaving = result.origin_date.toDateString();
      }
      if (result.return_date) {
        var _month = result.return_date.getMonth() + 1,
          _day = result.return_date.getDate();
        if (_month < 10) _month = '0' + _month;
        if (_day < 10) _day = '0' + _day;
        $('#returnDate').data('date', result.return_date.getFullYear() + '-' + _month + '-' + _day);
        var picker = $('#dr_picker').data('DateTimePicker');
        picker.date(result.return_date);
        returning = result.return_date.toDateString();
      }

      $('#date_select_top').trigger('click');

      out_field += ", leaving on " + leaving + " " + (returning ? " returning on " + returning + " " : ".");
    } else {
      out_field += " I did not find dates in your request. ";
      return false;
    }

    if (result.class_of_service) {
      $('input[name=preferedClass]').each(function (i, o) {
        var _txt = $(o).parents('label').text();
        if (_txt.toLowerCase().indexOf(result.class_of_service.toLowerCase()) != -1) {
          $(o).prop('checked', true);
          $(o).parents('label').trigger('click');
        }
      });
    }

    if (result.number_of_tickets && (result.number_of_tickets > 0 || result.number_of_tickets == "multiple")) {
      out_field += " You need " + result.number_of_tickets
      + (result.number_of_tickets == 1 ? " ticket" : " tickets") + " "
      + (result.class_of_service ? " in " + result.class_of_service + " class " : "") + ". \n";
      if (result.number_of_tickets == "multiple") {
        result.number_of_tickets = 4;
      }

      if (digits[result.number_of_tickets]) {
        $('#passengers').val(result.number_of_tickets);
        $('.passengers_count').text(digits[result.number_of_tickets]);
      }
    }

    if (result.class_of_service) {
      out_field += " You are travelling in " + result.class_of_service + " class.";
      if (serviceClass && serviceClass[result.class_of_service]) {
        $('#preferedClass').val(result.class_of_service);
        $('.flight-class-info-item .text-picker').text(serviceClass[result.class_of_service]);
      }
    }

    return true;
  }
})();
