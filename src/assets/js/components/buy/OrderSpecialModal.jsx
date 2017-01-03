import React from 'react';
import { browserHistory } from 'react-router';

let OrderSpecialModal = React.createClass({
  componentDidMount: function () {
    $("#user-price-modal").modal({
      backdrop: 'static',
      keyboard: false
    });

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
  },

  render: function () {

    return (
      <div className="modal continuous-search" id="user-price-modal" role="dialog">
        <div className="modal-dialog">
          <div className="modal-content">

            <div className="title-bar">
              <div  id="user-price-close" className="close-x" onClick={() => {$("#user-price-modal").modal("hide");browserHistory.push('/result');return false;}}></div>
              <div className="title">Choose Your Price</div>
            </div>

            <form role="form" id="form_user_price">

              <div className="modal-body">
                <div className="sub-title">Continuous search for better price.</div>

                <div className="form-group">
                  <label className="required" htmlFor="user_price">Price you commit for this itinerary:</label>
                  <input type="text" className="form-control input-sm" id="user_price" name="user_price" placeholder="Enter your price"/>
                </div>
                <div className="form-group">
                  <label className="required" htmlFor="user_timelimit">Time limit for getting the fare:</label>
                  <input type="text" className="form-control input-sm" id="user_timelimit" name="user_timelimit" placeholder="Enter days"/>
                </div>

              </div>

              <div className="buttons-bar double">
                <button  id="user-price-cancel" type="button" className="big-button secondary" onClick={() => {$("#user-price-modal").modal("hide");browserHistory.push('/result');return false;}}>Cancel</button>
                <button type="submit" className="big-button" id="user-price-submit">Submit</button>
              </div>

            </form>

          </div>
        </div>
      </div>
    );
  }

});

export default OrderSpecialModal;
