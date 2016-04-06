/* global $ */
$(document).ready(function() {
  
    $("#cancelMilesPrograms").click(function () {
    cancelMilesPrograms();
  });
  
  var cancelMilesPrograms = function () {
    var _fieldset = $('#AFFMP');
    _fieldset.addClass('hidden');
    $('#buy_button, #searchResultData, nav.navbar').removeClass('hidden');
    $('body').css('padding-top', ($('#tiles_ui').outerHeight(true) - 20) + 'px');
    $( window ).trigger('resize');
    $('input[name=airlineName]', _fieldset).val('');
    $('input[name=accountNumber]', _fieldset).val('');
    $('input[name=flierMiles]', _fieldset).val('');
    $('input[name=expirationDate]', _fieldset).val('');
  };
  
  var checkAirlineFlierMilesProgram = function (filter) {
    var name = $.trim(filter.replace('airline_tile_', '')),
      _name = name.replace('_', ' '),
      _fieldset = $('#AFFMP');
    if (_fieldset.attr('for') == name) return;
    $('input[name=airlineName]', _fieldset).val(_name);
    if (name) {
      $.ajax({
          method: "POST",
          url: "/user/checkAFFMP",
          data: {
            airlineName: name.replace('_', ' ')
          }
        })
        .done(function( msg ) {
          if (msg && !msg.checked) {
            $('#buy_button, #searchResultData, nav.navbar').addClass('hidden');
            $('body').css('padding-top', 0);
            _fieldset.removeClass('hidden');
          }
        });
    }
  
    _fieldset.attr('for', name);
  };
  
  $('#saveMilesPrograms').click(function () {
    var _fieldset = $('#AFFMP'),
      data = {
        airlineName:    $.trim($('input[name=airlineName]', _fieldset).val()),
        accountNumber:  $.trim($('input[name=accountNumber]', _fieldset).val()),
        flierMiles:     $.trim($('input[name=flierMiles]', _fieldset).val()),
        expirationDate: $.trim($('input[name=expirationDate]', _fieldset).val())
      };
    if (data.airlineName) {
      $.ajax({
          method: "POST",
          url:    "/user/addMilesPrograms",
          data:   data
        })
        .done(function( msg ) {
          if (msg.error) {
            $('#timeAlert').text('Error saving data to Airlines Frequent Flier Miles Programs.')
              .fadeIn('slow', function () {
                  $(this).fadeOut(5000, function () {
                    $('body').css('padding-top', ($('#tiles_ui').outerHeight(true) - 20 ) + 'px');
                  });
                }
              );
          } else {
            $('#timeAlert').text('Your data for Airlines Frequent Flier Miles Programs has been saved.')
              .fadeIn('slow', function () {
                  $(this).fadeOut(5000, function () {
                    $('body').css('padding-top', ($('#tiles_ui').outerHeight(true) - 20 ) + 'px');
                  });
                }
              );
          }
        });
    }
    cancelMilesPrograms();
  });

});