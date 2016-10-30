var Citypairs = React.createClass({
  getInitialState: function() {
    return {
      citypairs: this.props.citypairs,
      information: this.props.information
    };
  },

  showFMiles: function(miles) {
    if( miles === false ) {
      // spinner here
      return <div className="ff-miles no-value">
        Frequent Flyer miles
        <div className="icon-spinner"></div>
      </div>
    } else if (miles.value > 0) {
      // successful result
      return <div className="ff-miles">
        <span className="ff-program">{miles.name + ' - '}</span>
        <span className="ff-count">{miles.value + ' miles'}</span>
      </div>
    }
    // 0 result or error
    return <div className="ff-miles none">No Frequent Flyer miles</div>
  },

  showRefundType: function (refundType) {
    $('input[name=refundType]').val(refundType);
    if (refundType === false) {
      return <div className="icon-spinner"></div>
    } else {
      return refundType;
    }
  },

  render: function() {
    return (
      <div className="row notable-area">
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
        {this.showFMiles(this.props.miles)}
        <div className="refundable row">
          <div className="col-xs-3 text-nowrap notable-text detail-col times">Refund Type:</div>
          <div className="col-xs-8 text-left detail-col">{this.showRefundType(this.props.refundType)}</div>
        </div>
      </div>
    )
  }
});
