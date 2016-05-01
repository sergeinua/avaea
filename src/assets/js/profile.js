/* global $ */
$(document).ready(function() {

  $('.mymoreprofilebutton').click(function (el) {
    var cloneTarget = $(this).attr('for');
    var clone = $('#' + cloneTarget).clone().find("input").val("").end();

    clone.find('hr').removeClass('hidden');
    clone.appendTo($('#' + cloneTarget).parent());
    return false;
  });


  //remove fieldset
  $('.remove-fieldset').click(function(event){
    var fieldset = $(this).attr('fieldset'),
      iterator = $(this).attr('iterator');

    $.ajax({
        method: "POST",
        url: "/user/removeFieldSet",
        data: {fieldset: fieldset, iterator: iterator}
      })
      .done(function( msg ) {


        if (msg.error) {

          $('#timeAlert').text('Error saving data to ' + fieldset + '.')
            .fadeIn('slow', function () {
                $(this).fadeOut(5000, function () {
                  recalculateBodyPadding();
                });
              }
            );

        } else {

          $('#' + fieldset + '[fieldset-number="' + iterator + '"]').remove();
          $('#' + fieldset + ':first > hr').remove();
          if ($('#' + fieldset + ' .remove-fieldset').length == 1) {
            $('#' + fieldset + ' .remove-fieldset').remove();
          }

          $('#timeAlert').text('Record was removed successfully.')
            .fadeIn('slow', function () {
                $(this).fadeOut(5000, function () {
                  recalculateBodyPadding();
                });
              }
            );
        }
      });

  });


});