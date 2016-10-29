/* global $ */

$(document).ready(function() {

  /**
   * Added according to DEMO-707
   * @link https://avaeaeng.atlassian.net/browse/DEMO-707
   */
  $.validator.addMethod("lettersonly", function(value, element) {
    console.log(value, element);
    return this.optional(element) || /^[a-z]+$/i.test(value);
  }, "Please remove any non alphabetical characters from your name");

  /**
   * Client validation during booking of itinerary
   */
  $("#form_booking").validate({
    rules: {
      PaxType: {
        required: true
      },
      FirstName: {
        required: true,
        lettersonly: true
      },
      LastName: {
        required: true,
        lettersonly: true
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
    errorPlacement: function(error, element) {
      if (element.attr("name") == "FirstName" || element.attr("name") == "LastName" ) {
        error.insertAfter(element);
      }
      // Skip other error messages
    },
    highlight: function(input) {
      $(input).parent().addClass('has-error');
    },
    unhighlight: function(input) {
      $(input).parent().removeClass('has-error');
    },

    // booking modal
    submitHandler: function(form) {
    	var _isError = false;

    	if ($('.booking .form input').parent().hasClass('has-error')) {
    		_isError = true;
    		return false;
    	}  else {
	      $("#bookingModal").modal();
	      return true;
     }
    }

  });


});




