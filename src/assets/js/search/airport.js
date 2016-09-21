$(document).ready(function() {

  // /**
  //  * Make request to the remote server and fetch data for the typehead rendering
  //  *
  //  * @param {string} controllerName
  //  * @param {string} actionName
  //  * @returns {Function}
  //  */
  // var fetchTypeheadSrc = function(controllerName, actionName) {
  //   return function (q, cb) {
  //     $.ajax({
  //       url: '/'+controllerName+'/'+actionName,
  //       type: 'get',
  //       data: {q: q},
  //       dataType: 'json',
  //       async: false // required, because typehead doesn't work with ajax in async mode
  //     })
  //       .done(function( msg ) {
  //         cb(msg ? msg : []);
  //       })
  //       .fail(function (msg) {
  //         cb([]);
  //       });
  //   };
  // };

  // var removeAirportSearcher = function() {
  // 	$('#search_title').hide();
  //   $('#main').show();
  //   $('#main_title').show();
  //   $('#airport-input').val('');
  //   $('#airport-input').typeahead('val','');
  // }

  // $('#airport-input').typeahead({
  //   hint: true,
  //   highlight: true,
  //   minLength: 2
  // }, {
  //   name: 'airports',
  //   display: 'value',
  //   limit: 99, // Increase default value. Will limited by controller
  //   source: fetchTypeheadSrc('ac', 'airports'),
  //   templates: {
  //     empty: [
  //       '<div class="empty-message">',
  //       'This airport does not seem to exist.',
  //       '</div>'
  //     ].join('\n'),
  //     suggestion: function(vars) {
  //       return '<div>('+vars.value+') '+vars.city+', '+vars.name+'</div>';
  //     }
  //   }
  // }).on('typeahead:selected', function (obj, datum) {
  //   var target = $(this).attr('target');
  //   setAirportData(target, datum);
  //   drawAirportData(target);
  //   removeAirportSearcher();
  // });
  // $('.tt-hint').addClass('form-control');

  // $('.flight-direction-item,.flight-direction-item-selected').on('click', function () {
  //   $('#main_title').hide();
  //   $('#main').hide();
  //   $('#search_title').show();
  //   $('#airport-input').focus();
  //   var target = ($(this).is('#from-area') || $(this).is('#from-area-selected') ? 'origin' : 'destination') + 'Airport';
  //   $('#airport-input').attr('target', target);
  //   var val = $('#' + target).val();
  //   $('#airport-input').val(val);
  //   $('#airport-input').typeahead('val', val);
  //   $('#airport-input').typeahead('open');
  // });
  //
  // $('#search_button_top').on('click', function () {
  //   removeAirportSearcher();
  // });


});
