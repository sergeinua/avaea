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

                {this.props.info.information.map(function (item, i) {
                  return <div className="extras" key={"fl-info-" + i}>
                      <div className="name">{item.name}</div>
                      <div className="value">{'$'+item.price.toFixed(2) }</div>
                    </div>
               })}
               
               
              <div className="row second row what is it">
                <div className="total-title">
                  {'Extra value from ' + this.props.info.citypairs[0].from.airline}
                </div>
                <div className="total-value">
                  {'$' + this.props.info.additionalPrice}
                </div>
              </div>
              
                
                <div className="buttons">
                  <button type="button" className="big-button.secondary" onClick={this.closeModal()}>Ok!</button>
                </div>
                
                
              </div>
            </div>
          </div>
        </div>
    )
  }

});
