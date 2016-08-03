/* global $ */
$(document).ready(function() {

  /**
   * Client validation during booking of itinerary
   */
// DEMO-512 disable bookings
  $("#form_booking").submit(function() {
    $('#buy-message').modal();
    return false;
  });
/*
 FIXME: DEMO-512 Please turn off all input validation on the booking page.
  $("#form_booking").validate({
    rules: {
      PaxType: {
        required: true
      },
      FirstName: {
        required: true
      },
      LastName: {
        required: true
      },
      Gender: {
        required: true
      },
      DateOfBirth: {
        required: true,
        date: true,
        minlength: 10,
        maxlength: 10
      },
      Address1: {
        required: true
      },
      City: {
        required: true
      },
      State: {
        required: true
      },
      Country: {
        required: true
      },
      ZipCode: {
        required: true
      },
      CardType: {
        required: true
      },
      CardNumber: {
        required: true,
        digits: true,
        minlength: 16,
        maxlength: 16
      },
      ExpiryDate: {
        required: true,
        minlength: 7,
        maxlength: 7
      },
      CVV: {
        required: true,
        digits: true,
        minlength: 3,
        maxlength: 3
      }
    },
    errorPlacement: function(error, element){}, // Skip error messages
    highlight: function(input) {
      $(input).parent().addClass('has-error');
    },
    unhighlight: function(input) {
      $(input).parent().removeClass('has-error');
    }
    //onkeyup: false
  });
*/
});
