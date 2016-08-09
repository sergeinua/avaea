$(document).ready(function() {

  $("#user-price-modal").modal();

  $("#form_user_price").validate({
    rules: {
      user_timelimit: {
        required: true,
        digits: true,
        minlength: 1,
        maxlength: 2
      },
      user_price: {
        required: true,
        digits: true,
        minlength: 2,
        maxlength: 5
      }
    },
    errorPlacement: function(error, element){}, // Skip error messages
    highlight: function(input) {
      $(input).parent().addClass('has-error');
    },
    unhighlight: function(input) {
      $(input).parent().removeClass('has-error');
    },
    submitHandler: function(form) {
      $('.itinerary-price').text('$' + $('#user_price').val() + '*');
      $('#user-time-limit-target-div').removeClass('hidden');
      $('#user-time-limit-target').text($('#user_timelimit').val());
      $("#user-price-modal").modal("hide");
      return false;
    }
  });


});
