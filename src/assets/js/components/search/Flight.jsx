var Flight = React.createClass({
  getInitialState: function() {
    return {
      pair: this.props.pair,
      flight: this.props.flight
    };
  },

  showNoStops: function(flight) {
    if (flight.noOfStops > 0) {
      return <span className="hidden-xs small text-danger">{'+' + flight.noOfStops + (parseInt(flight.noOfStops) > 1 ? ' stops' : ' stop')}</span>
    }
    return ''
  },

  render: function() {
    return (
      <div className="details">
        { this.props.count?
          <div className="row switch-planes">
            <div className="col-xs-5 text-nowrap detail-col change-planes">Change planes</div>
            <div className="col-xs-2 detail-col">{ this.state.pair.stops[this.props.count - 1].code }</div>
            <div
              className="col-xs-2 col-xs-offset-3 detail-col">{ this.state.pair.stops[this.props.count - 1].duration }</div>
          </div>:''
        }
        <div className="row details info">
          <div className="col-xs-3 text-nowrap notable-text detail-col flight-no">
            <span
              className="itinerary-airline-icon"
              style={{backgroundPosition: "0 -" + InitResultData.iconSpriteMap[this.state.flight.airlineCode] * 15 + "px"}}
              alt={ this.state.flight.airlineCode }
              title={ this.state.flight.airline }>
            </span>
            <span className="flightNumber">{this.state.flight.abbrNumber}</span>
          </div>
          <div className="col-xs-2 text-nowrap detail-col date">{ moment(this.state.flight.from.date).format('DD MMM') }</div>
          <div className="col-xs-2 text-nowrap detail-col dest">{ this.state.flight.from.code + ' ' + this.state.flight.to.code }</div>
          <div className="col-xs-3 text-nowrap notable-text detail-col times">{ this.state.flight.from.time + '-' + this.state.flight.to.time }</div>
          <div className="col-xs-2 text-nowrap detail-col length" dangerouslySetInnerHTML={ createMarkup(this.state.flight.duration + this.showNoStops(this.state.flight))}></div>
        </div>
        { this.state.flight.stops.map(function (stop) {
        return  <div className="row stopovers">
                  <div className="col-xs-5 text-nowrap detail-col stopover">Intermediate stop</div>
                  <div className="col-xs-2 detail-col">{ stop.code }</div>
                  <div className="col-xs-2 col-xs-offset-3 detail-col">{ stop.duration }</div>
                </div>
      })}
      </div>
    )
  }
});
