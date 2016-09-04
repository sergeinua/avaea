var ModalFlightInfo = React.createClass({
  closeModal: function () {
    $('[data-id=' + this.props.id +']').modal('hide');
  },
  render() {
    return (
      <div data-id={this.props.id} className="modal flight-extras" role="dialog">
        <div className="modal-dialog">
          <div className="modal-content">
          
              <div className="title-bar">
                <div className="close-x" onClick={this.closeModal()}></div>
                <div className="title">Extras</div>
              </div>
  
              <div className="modal-body">
              
                   {this.props.info.information.map(function (item, i) {
                      return <div className="extras" key={"fl-info-" + i}>
                          <div className="name">{item.name}</div>
                          <div className="value">{'$'+item.price.toFixed(2) }</div>
                        </div>
                   })}
                   
                   
                    <div className="total">
                      <div className="value-from">Extra value from</div>
                        <div className="wrapper">
                          <div className="airline">
                            {this.props.info.citypairs[0].from.airline}
                          </div>  
                          <div className="total-value">
                            {'$' + this.props.info.additionalPrice}
                          </div>
                      </div>
                    </div>
                  
                </div>
              
                <div className="buttons-bar">
                  <button type="button" className="single big-button secondary" onClick={this.closeModal()}>Ok</button>
                </div>
              
            </div>
          </div>
        </div>
    )
  }

});
