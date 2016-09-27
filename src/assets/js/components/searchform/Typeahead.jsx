/**
 * Make request to the remote server and fetch data for the typehead rendering
 *
 * @param {string} controllerName
 * @param {string} actionName
 * @returns {Function}
 */
var fetchTypeheadSrc = function(controllerName, actionName) {
  console.log('ajax call fetchTypeheadSrc');
  return function (q, cb) {
    $.ajax({
      url: '/'+controllerName+'/'+actionName,
      type: 'get',
      data: {q: q},
      dataType: 'json',
      async: false // required, because typehead doesn't work with ajax in async mode
    })
      .done(function( msg ) {
        console.log('ajax call fetchTypeheadSrc done');
        cb(msg ? msg : []);
      })
      .fail(function (msg) {
        cb([]);
      });
  };
};

var setAirportData = function(target, data) {
  //FIXME get rid from jquery
  $('#' + target).val(data.value);
  $('#' + target).attr('city', data.city);
};

var Typeahead = React.createClass({
  componentDidMount: function () {
    let target = this.props.target;
    //FIXME get rid from jquery
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
          'This airport does not seem to exist.',
          '</div>'
        ].join('\n'),
        suggestion: function(vars) {
          return '<div>('+vars.value+') '+vars.city+', '+vars.name+'</div>';
        }
      }
    }).on('typeahead:selected', function (obj, datum) {
      setAirportData(target, datum);
      ActionsStore.changeForm($('#search_form').data('flight-type') || 'round_trip');
      ActionsStore.updateFormValues();
    });

    // if (this.props.target) {
      // $('#airport-input').attr('target', this.props.target);
      var val = $('#' + this.props.target).val();
      $('#airport-input').focus();
      $('#airport-input').val(val);
      $('#airport-input').typeahead('val', val);
      $('#airport-input').typeahead('open');
    // }

    //FIXME what is it?
    $('.tt-hint').addClass('form-control');

  },
  render() {
    //Empty component to keep typeahead logic
    return (
      <span />
    )
  }

});
