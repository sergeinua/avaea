import React from 'react';


let ModalCvvInfo = React.createClass({
  closeModal: function () {
    $('#modal-cvv-info').modal('hide');
  },
  render() {
    return (
      <div data-id="modal-cvv-info" id="modal-cvv-info" className="modal cvv-info" role="dialog">
        <div className="modal-dialog">
          <div className="modal-content">

              <div className="title-bar">
                <div className="close-x" onClick={this.closeModal()}></div>
                <div className="title">CVV</div>
              </div>

              <div className="modal-body"></div>

              <div className="buttons-bar single">
                <button type="button" className="big-button" onClick={this.closeModal()}>Ok</button>
              </div>

            </div>
          </div>
        </div>
    )
  }

});

export default ModalCvvInfo;
