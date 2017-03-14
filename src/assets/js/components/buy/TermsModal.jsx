import React from 'react';
import StaticTerms from '../static/terms/Terms.jsx';

let TermsModal = React.createClass({

  closeModal: function () {
    $('.terms-modal').modal('hide');
  },

  render: function () {

    return (
        <div className="modal terms-modal" id="TermsModal" role="dialog">
          <div className="modal-dialog">
            <div className="modal-content">

              <div className="title-bar">
                <div className="close-x" onClick={this.closeModal}></div>
                <div className="title">Terms</div>
              </div>
              
              <div className="modal-body">

                  <div className="terms-holder">

                    <StaticTerms/>

                  </div>

              </div>
            </div>
          </div>
        </div>
    );
  }

});

export default TermsModal;





