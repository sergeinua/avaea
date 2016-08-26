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
        <div className="col-xs-12">
          {this.state.citypairs.map(function (pair, i) {
            i++;
            return  <div key={i}><div className="row">

              <div className="col-xs-3"><strong>{ pair.direction }</strong></div>
              <div className="col-xs-9">
                <MerchandisingInfo flights={pair.flights}/>
              </div>

            </div>
            { pair.flights.map(function (flight, j) {
              return <Flight  key={j} flight={flight} count={j} pair={pair}/>
            })}
            </div>
          })}
        </div>
      </div>
    )
  }
});
