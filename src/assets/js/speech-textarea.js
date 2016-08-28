(function ($) {
  'use strict';
  var final_transcript = '';
  var recognizing = false;
  var ignore_onend;
  var start_timestamp;
  var start_button = $('#start_button');
  var final_textarea = $('#voiceSearchTextarea');
  var clear_button = $('.voice-form .clear-textarea');
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
  }
  
  clear_button.click(function() {
    final_textarea.val('');
    showButtons(true);
    final_textarea.focus();
  });

  final_textarea.bind('keyup change paste cut', function () {
    var elem = $(this);
    setTimeout(function () {
      var _value = $.trim(elem.val());
      if (_value != '' && _value.length > 0 && cntWords(_value)) {
        showButtons(false);
      } else {
        showButtons(true);
      }
    }, 100);
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

    SearchForm.updatePassengers(1);

    $('#preferedClass').val('E');
    $('.flight-class-info-item .text-picker').text(serviceClass['E']);
  };

  $('#voiceSearchFlight').click(function () {
    if ($(this).hasClass('disabled')) return;
    if (recognition && recognizing) {
      recognition.stop();
    }
    demo(function(res, data) {
      log("Result of demo: "+JSON.stringify(data));
      loggerQuery(data, (res ? 'success' : 'failed'));
    });

  });

  function notSupported() {
    log('Web Speech API is not supported by this browser.');
    if (!isMobileDev) {
      final_textarea.attr('placeholder', 'This browser is not enabled for voice commands.');
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
      $('#voiceSearchFlight').addClass('disabled');
    } else if (!$('.voice-form').is(':hidden')) {
      $('#voiceSearchFlight').removeClass('disabled');
    }
  }

  function loggerQuery(q, result) {
    $.ajax({
      url: '/voice/logger',
      type: 'post',
      data: {
        q: q,
        result: result
      },
      dataType: 'json'
    }).done(function( msg ) {
      if( !msg.success ) {
	log("Result of logger query: "+JSON.stringify(msg));
      }
    });
  }

  /**
   * I would like to fly from San Francisco to London on 29th
   * I would like to fly from San Francisco to Kiev on 30th the first class with my son return on July 30th
   * I need 2 tickets from San Jose to Moscow on July 10th returning two weeks later
   */
  function demo(callback) {
    $.ajax({
      url: '/voice/parse',
      type: 'get',
      data: {q: $.trim(final_textarea.val())},
      dataType: 'json'
    }).done(function( result ) {

      var text = $.trim(final_textarea.val());
      var _airportsKeys = {origin_airport: 'originAirport', destination_airport: 'destinationAirport'};
      var _airportsPromises = [], _airportsPromisesKeys = [];

      result.origin_date = result.origin_date ? new Date(result.origin_date) : false;
      result.return_date = result.return_date ? new Date(result.return_date) : false;

      for(var _k in _airportsKeys) {
        if (result[_k]) {
          // reset airport {{{
          setAirportData(_airportsKeys[_k], {value: '', city: ''});
          drawAirportData(_airportsKeys[_k]);
          // }}} reset airport
          _airportsPromisesKeys.push(_k);
          _airportsPromises.push($.ajax({
            url: '/ac/airports',
            type: 'get',
            data: {q: $.trim(result[_k]), l: 1},
            dataType: 'json'
          }));
        } else {
          result[_k] = "an unknown airport";
        }
      }
      if( !_airportsPromises.length ) {
        return callback(false, result);
      }

      $.when.apply($, _airportsPromises).done(function() {
        // Each argument is an array with the following structure: [ data, statusText, jqXHR ]
        for (var i = 0; i < arguments.length; i++) {
          if (arguments[i][0] && arguments[i][0].length) {
            setAirportData(_airportsKeys[_airportsPromisesKeys[i]], arguments[i][0][0]);
            drawAirportData(_airportsKeys[_airportsPromisesKeys[i]]);
          }
        }

        if (result.type == 'round_trip') {
          $('#round_trip').trigger('click');
        }
        if (result.type == 'one_way') {
          $('#one_way').trigger('click');
        }

        if (result.origin_date || result.return_date) {
          var leaving, returning;
          var picker = $('#dr_picker').data('DateTimePicker');
          picker.clear();
          if (result.origin_date && picker.maxDate().isSameOrAfter(result.origin_date)) {
            var _month = result.origin_date.getMonth() + 1,
              _day = result.origin_date.getDate();
            if (_month < 10) _month = '0' + _month;
            if (_day < 10) _day = '0' + _day;
            $('#departureDate').data('date', result.origin_date.getFullYear() + '-' + _month + '-' + _day);
            picker.date(result.origin_date);
            leaving = result.origin_date.toDateString();
            // we can't set return date on search form without origin date
            if (result.return_date && picker.maxDate().isSameOrAfter(result.return_date)) {
              var _month = result.return_date.getMonth() + 1,
                _day = result.return_date.getDate();
              if (_month < 10) _month = '0' + _month;
              if (_day < 10) _day = '0' + _day;
              $('#returnDate').data('date', result.return_date.getFullYear() + '-' + _month + '-' + _day);
              picker.date(result.return_date);
              returning = result.return_date.toDateString();
            } else if (result.type == 'round_trip') {
              result.type = 'one_way';
              $('#one_way').trigger('click');
            }
          }

          if (leaving) {
            $('#date_select_top').trigger('click');
          }

        }

        if (result.number_of_tickets && (result.number_of_tickets > 0 || result.number_of_tickets == "multiple")) {
          if (result.number_of_tickets == "multiple") {
            result.number_of_tickets = 4;
          }
        } else {
          result.number_of_tickets = 1;
        }
        SearchForm.updatePassengers(result.number_of_tickets);


        if( !result.class_of_service ) {
          result.class_of_service = 'E';
        }
        $('input[name=preferedClass]').each(function (i, o) {
          var _txt = $(o).parents('label').text();
          if (_txt.toLowerCase().indexOf(result.class_of_service.toLowerCase()) != -1) {
            $(o).prop('checked', true);
            $(o).parents('label').trigger('click');
          }
        });
        if (serviceClass && serviceClass[result.class_of_service]) {
          $('#preferedClass').val(result.class_of_service);
          $('.flight-class-info-item .text-picker').text(serviceClass[result.class_of_service]);
        }

        $('#voiceSearchQuery').val(JSON.stringify(result));
        switch (result.action) {
          case 'top':
            $('#topSearchOnly').val(1);
          case 'all':
            $('#search_form').submit();
            break;
        }

        return callback(true, result);
      }).fail(function(){
        return callback(false, result);
      });
    }).fail(function (err) {
      return callback(false, result);
    });
  }
})(jQuery);
