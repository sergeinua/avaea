
var setAirlineData = function(target, data) {
  //FIXME get rid from jquery
  $('#' + target).val(data.name);
  $('#' + target).typeahead('close'); // is not work
  // Hardcode, but does not work also:
  // $('.tt-menu').css('z-index', -1);
};

var UserProfilePanelAirlineSuggest = React.createClass({

  componentDidMount: function () {
    let target = this.props.target;
    //FIXME get rid from jquery
    $('#airline1').typeahead({  // @TODO make dynamic elements ids
      hint: true,
      highlight: true,
      minLength: 2
    }, {
      name: 'airlines',
      display: 'value',
      limit: 99, // Increase default value. Will limited by controller
      source: fetchTypeheadSrc('ac', 'airlines'),
      templates: {
        empty: [
          '<div class="empty-message">',
          'This airline does not seem to exist.',
          '</div>'
        ].join('\n'),
        suggestion: function(vars) {
          return '<div>'+vars.name+'</div>';
        }
      }
    }).on('typeahead:selected', function (obj, datum) {
      setAirlineData(target, datum);
    });
  },

  render: function () {
    //Empty component to keep typeahead logic
    return (
      <span />
    )
  }

});
