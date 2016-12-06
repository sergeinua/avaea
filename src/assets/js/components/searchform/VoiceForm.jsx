var final_transcript = '';
var recognizing = false;
var ignore_onend;
var start_timestamp;
var final_textarea = $('#voiceSearchTextarea');
var recognition = null;

var cntWords = function (val) {
  var words = val.split(' ');
  return (words.length >= 3);
};

function loggerQuery(q, result) {

  fetch('/voice/logger', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: q,
      result: result
    }),
    credentials: 'same-origin' // required for including auth headers
  })
    .then((response) => response.json())
    .then((msg) => {
      if( !msg.success ) {
        console.error("Result of logger query: " + JSON.stringify(msg));
      }
    })
    .catch((error) => {
      console.log(error);
    });
}


var VoiceForm = React.createClass({
  getInitialState: function() {
    var text = 'Activate the mic. Then specify your from and to cities, and dates of travel';
    //FIXME get rid from jquery
    if (!$('body').hasClass('desktop')) {
      text = 'Tap here. Then tap the microphone icon on the keyboard.'
    }
    var isMobileDev = navigator.userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile/i);
    if (!('webkitSpeechRecognition' in window)) {
      console.log('Web Speech API is not supported by this browser.');
      if (!isMobileDev) {
        text = 'This browser is not enabled for voice commands.';
      }
    }
    return {
      placeholderText: text,
      voiceSearchValue: ''
    };
  },

  componentWillMount: function () {
    ActionsStore.ClearVoiceInput = () => {
      this.setState({voiceSearchValue: ''});
      //FIXME remove jquery
      $('#clear_button').removeClass('has-input');
      $('#voiceSearchTextarea').focus();
    }
  },

  componentDidMount: function () {
    if ('webkitSpeechRecognition' in window) {
      recognition = new webkitSpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = function () {
        recognizing = true;
        console.log('info_speak_now');
      };

      recognition.onerror = function (event) {
        if (event.error == 'no-speech') {
          console.log('info_no_speech');
          ignore_onend = true;
        }
        if (event.error == 'audio-capture') {
          console.log('info_no_microphone');
          ignore_onend = true;
        }
        if (event.error == 'not-allowed') {
          if (event.timeStamp - start_timestamp < 100) {
            console.log('info_blocked');
          } else {
            console.log('info_denied');
          }
          ignore_onend = true;
        }
      };

      recognition.onend = function () {
        recognizing = false;
        if (ignore_onend) {
          return;
        }
        if (!final_transcript) {
          console.log('info_start');
          return;
        }
        console.log('End speech');
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
        console.log(final_transcript);
        if (final_textarea) final_textarea.empty().val(final_transcript);
        if (interim_transcript) final_textarea.val(capitalize(interim_transcript));
        // if (final_transcript || interim_transcript);
      };
    }

    final_textarea.focus();
  },

  handleChange: function(event) {
    this.setState({voiceSearchValue: event.target.value}, function() {
      if (this.state.voiceSearchValue) {
        $('#clear_button').addClass('has-input');
      } else {
        $('#clear_button').removeClass('has-input');
      }
    });
  },

  handleVoiceSearchStop: function () {
    if (!this.state.voiceSearchValue) return;
    if (recognition && recognizing) {
      recognition.stop();
    }
    this.demo(function(res, data) {
      ActionsStore.validateCalendar();
      console.log("Result of demo: ", data);
      loggerQuery(data, (res ? 'success' : 'failed'));
      if (res && (data.action=='top' || data.action=='all')) {
        ActionsStore.updateNavBarPage('result');
      }
    });
  },

  /**
   * I would like to fly from San Francisco to London on 29th
   * I would like to fly from San Francisco to Kiev on 30th the first class with my son return on July 30th
   * I need 2 tickets from San Jose to Moscow on July 10th returning two weeks later
   */
  demo: function (callback) {

    fetch('/voice/parse', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({q: this.state.voiceSearchValue}),
      credentials: 'same-origin' // required for including auth headers
    })
    .then((response) => response.json())
    .then((result) => {
      var _airportsKeys = {origin_airport: 'DepartureLocationCode', return_airport: 'ArrivalLocationCode'};
      var _airportsPromises = [], _airportsPromisesKeys = [];

      result.origin_date = result.origin_date ? new Date(result.origin_date) : false;
      result.return_date = result.return_date ? new Date(result.return_date) : false;

      for (var _k in _airportsKeys) {
        // reset airport {{{
        setAirportData(_airportsKeys[_k], {value: '', city: ''});
        // }}} reset airport
        if (result[_k]) {
          _airportsPromisesKeys.push(_k);
          _airportsPromises.push($.ajax({
            url: '/ac/airports',
            type: 'POST',
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
        let _arguments;

        if (_airportsPromisesKeys.length == 1) {
          _arguments = [arguments];
        } else {
          _arguments = arguments;
        }

        for (var i = 0; i < _arguments.length; i++) {
          if (_arguments[i][0] && _arguments[i][0].length) {
            setAirportData(_airportsKeys[_airportsPromisesKeys[i]], _arguments[i][0][0]);
          }
        }

        if (result.origin_date || result.return_date) {
          var leaving, returning;
          // var picker = $('#dr_picker').data('DateTimePicker');
          // picker.clear();
          if (result.origin_date /*&& picker.maxDate().isSameOrAfter(result.origin_date)*/) {
            var _month = result.origin_date.getMonth() + 1,
              _day = result.origin_date.getDate();
            if (_month < 10) _month = '0' + _month;
            if (_day < 10) _day = '0' + _day;
            ActionsStore.setFormValue('departureDate', result.origin_date.getFullYear() + '-' + _month + '-' + _day);
            // picker.date(result.origin_date);
            leaving = result.origin_date.toDateString();
            // we can't set return date on search form without origin date
            if (result.return_date /*&& picker.maxDate().isSameOrAfter(result.return_date)*/) {
              var _month = result.return_date.getMonth() + 1,
                _day = result.return_date.getDate();
              if (_month < 10) _month = '0' + _month;
              if (_day < 10) _day = '0' + _day;
              ActionsStore.setFormValue('returnDate', result.return_date.getFullYear() + '-' + _month + '-' + _day);
              // picker.date(result.return_date);
              returning = result.return_date.toDateString();
            } else if (result.type == 'round_trip') {
              result.type = 'one_way';
              // $('#one_way').trigger('click');
            }
          }
          if (result.origin_date) {
            var origin_date = moment.isMoment(result.origin_date) ? result.origin_date : moment(result.origin_date || undefined);
            ActionsStore.setFormValue('departureDate', origin_date.format('YYYY-MM-DD') || '');
          }
          if (result.return_date) {
            var return_date = moment.isMoment(result.return_date) ? result.return_date : moment(result.return_date || undefined);
            ActionsStore.setFormValue('returnDate', return_date.format('YYYY-MM-DD') || '');
          }
          //
          // if (leaving) {
          //   $('#date_select_top').trigger('click');
          // }

        }

        if (result.number_of_tickets && (result.number_of_tickets > 0 || result.number_of_tickets == "multiple")) {
          if (result.number_of_tickets == "multiple") {
            result.number_of_tickets = 4;
          }
        } else {
          result.number_of_tickets = 1;
        }
        ActionsStore.setFormValue('passengers', result.number_of_tickets);

        if( !result.class_of_service ) {
          result.class_of_service = 'E';
        }

        if (serviceClass && serviceClass[result.class_of_service]) {
          ActionsStore.setFormValue('CabinClass', result.class_of_service);
        }
        // ActionsStore.updateFormValues();

        ActionsStore.setFormValue('voiceSearchQuery', JSON.stringify(result));
        switch (result.action) {
          case 'top':
            ActionsStore.setFormValue('topSearchOnly', 1);
          case 'all':
            ActionsStore.setFormValue('flightType', result.type);
            ActionsStore.submitForm();
            break;
        }
        ActionsStore.changeForm(result.type);

        return callback(true, result);
      }).fail(function(){
        return callback(false, result);
      });
    })
    .catch((error) => {
      console.log(error);
      return callback(false, result);
    });
  },

  render() {
    return (
      <div className="voice-form">
        <div className="col-xs-12 clearfix flight-direction-item-voice-search">
          <div className="voice-search-content">
            <textarea
              name="voiceSearch"
              id="voiceSearchTextarea"
              placeholder={this.state.placeholderText}
              value = {this.state.voiceSearchValue}
              onChange={this.handleChange}
              className="voice-search-textarea si-input">
            </textarea>
            <div className="ie-fixer placeholder"></div>
          </div>
        </div>
        <div className="col-xs-12 clearfix voice-search-buttons">
          <div
            className={this.state.voiceSearchValue ? "big-button":"big-button disabled"}
            id="voiceSearchFlight"
            onClick={this.handleVoiceSearchStop}
          >Continue</div>
        </div>
      </div>
    )
  }
});
