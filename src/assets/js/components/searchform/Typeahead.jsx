import React from 'react';
// import '../../dependencies/typeahead.bundle.min';
import { ActionsStore, setAirportData } from '../../functions.js';

/**
 * Make request to the remote server and fetch data for the typehead rendering
 *
 * @param {string} controllerName
 * @param {string} actionName
 * @returns {Function}
 */
var fetchTypeheadSrc = function(controllerName, actionName) {
  return function (q, cb) {
    $.ajax({
      url: '/'+controllerName+'/'+actionName,
      type: 'POST',
      data: {q: q},
      dataType: 'json',
      async: false // required, because typehead doesn't work with ajax in async mode
    })
      .done(function( msg ) {
        cb(msg ? msg : []);
      })
      .fail(function (msg) {
        cb([]);
      });
  };
};

let Typeahead = React.createClass({

  componentDidMount: function () {
    let _self = this;

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
      setAirportData(_self.props.target, datum);

      ActionsStore.changeForm(_self.props.searchParams.flightType || 'round_trip');
    });

    var val = this.props.searchParams[this.props.target] || '';
    var inputEl = $('#airport-input');
    inputEl.focus();
    inputEl.val(val);
    inputEl.typeahead('val', val);
    inputEl.typeahead('open');

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

export default Typeahead;
