/* global $ */
var UserProfileData, UserProfileStructure, UserProgramsStructure;

$(document).ready(function() {

  $(document).on('click', '.mymoreprofilebutton', function(el) {
    var cloneTarget = $(this).attr('data-for');
    var clone = $('#' + cloneTarget).clone().find("input").val("").end();

    clone.find('hr').removeClass('hidden');
    clone.appendTo($('#' + cloneTarget).parent());
    return false;
  });

  //remove fieldset
  $(document).on('click', '.remove-fieldset', function(event){
    var fieldset = $(this).attr('data-fieldset'),
      iterator = $('*[data-fieldset-name=' + fieldset + ']' ).index( $(event.target).parents('*[data-fieldset-name=' + fieldset + ']'));

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
                });
              }
            );

        } else {

          $('#' + fieldset + '[data-fieldset-number="' + iterator + '"]').remove();
          $('#' + fieldset + ':first > hr').remove();
          if ($('#' + fieldset + ' .remove-fieldset').length == 1) {
            $('#' + fieldset + ' .remove-fieldset').remove();
          }

          $('#timeAlert').text('Record was removed successfully.')
            .fadeIn('slow', function () {
                $(this).fadeOut(5000, function () {
                });
              }
            );
        }
      });

  });

  if (UserProfileData && UserProfileStructure && UserProgramsStructure) {
    ReactContentRenderer.render(<UserProfile profileData={UserProfileData} profileStructure={UserProfileStructure}
                                             programsStructure={UserProgramsStructure}/>, $('#UserProfile'));
  }
});
