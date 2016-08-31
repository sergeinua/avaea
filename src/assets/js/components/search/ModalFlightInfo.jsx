var ModalFlightInfo = React.createClass({
  closeModal: function () {
    $('[data-id=' + this.props.id +']').modal('hide');
  },
  render() {
    return (
      <div data-id={this.props.id} className="modal modal-flight-info-block" role="dialog">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-body">
              <div className="row">
                <div className="col-xs-6">Fare</div>
                <div className="col-xs-6 text-right">{'$' + this.props.info.specialprice }</div>
              </div>
              <div className="row">
                <div className="col-xs-11 col-xs-offset-1">includes:</div>
              </div>
                {this.props.info.information.map(function (item, i) {
                  return <div className="row" key={"fl-info-" + i}>
                      <div className="col-xs-5 col-xs-offset-1">
                         <span>
                           <span>{item.name}</span>
                         </span>
                      </div>
                      <div className="col-xs-6 text-right">{'$'+item.price.toFixed(2) }</div>
                    </div>
               })}
              <div className="row" style={{"borderTop": "1px solid #e5e5e5"}}>
                <div className="col-xs-8">{this.props.info.citypairs[0].from.airline + ' discount:'}</div>
                <div className="col-xs-4 text-right">
                  <span style={{"color":"red"}}>{'- $' + this.props.info.additionalPrice}</span>
                </div>
              </div>
              <div className="row">
                <div className="col-xs-8">Your Price:</div>
                  <div className="col-xs-4 text-right">{ '$' + this.props.info.price }</div>
                </div>
              </div>
              <div className="modal-footer modal-flight-info-footer">
                <button type="button" className="btn btn-default" onClick={this.closeModal()}>Close</button>
              </div>
            </div>
          </div>
        </div>
    )
  }

});
