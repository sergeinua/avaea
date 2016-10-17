var Citypairs = React.createClass({
  getInitialState: function() {
    return {
      citypairs: this.props.citypairs,
      information: this.props.information
    };
  },

  render: function() {
    return (
      <div className="row notable-area">
        {this.props.miles === false ?
          <div className="ff-miles">
            <div className="icon-spinner"></div>
            calculating miles
          </div>
          :
          <div className="ff-miles">{this.props.miles + ' miles'}</div>
        }
        {this.state.citypairs.map(function (pair, i) {
            i++;
            return  <div className="section" key={i}><div className="row title">

              <div className="col-xs-3 direction">
                { pair.direction }
              </div>

              <div className="col-xs-9 extras">
                <MerchandisingInfo flights={pair.flights}/>
              </div>

            </div>
            { pair.flights.map(function (flight, j) {
              return <Flight  key={j} flight={flight} count={j} pair={pair}/>
            })}
            </div>
          })}
        <div className="refundable">Refund Type:  </div>
      </div>
    )
  }
});
