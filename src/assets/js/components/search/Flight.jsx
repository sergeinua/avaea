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
      <div>
        { this.props.count?
          <div className="row">
            <div className="col-xs-5 text-nowrap detail-col-left">➲ Change planes</div>
            <div className="col-xs-2 detail-col">{ this.state.pair.stops[this.props.count - 1].code }</div>
            <div
              className="col-xs-2 col-xs-offset-3 detail-col">{ this.state.pair.stops[this.props.count - 1].duration }</div>
          </div>:''
        }
        <div className="row">
          <div className="col-xs-3 text-nowrap notable-text detail-col-left">
            <span
              className="itinerary-airline-icon"
              data-sprite_num={ InitResultData.iconSpriteMap[this.state.flight.airlineCode] }
              alt={ this.state.flight.airlineCode }
              title={ this.state.flight.airline }></span>
            <span>{this.state.flight.abbrNumber}</span>
          </div>
          <div className="col-xs-2 text-nowrap detail-col">{ moment(this.state.flight.from.date).format('DD MMM') }</div>
          <div className="col-xs-2 text-nowrap detail-col">{ this.state.flight.from.code + ' ' + this.state.flight.to.code }</div>
          <div className="col-xs-3 text-nowrap notable-text detail-col">{ this.state.flight.from.time + '-' + this.state.flight.to.time }</div>
          <div className="col-xs-2 text-nowrap detail-col">{ this.state.flight.duration + this.showNoStops(this.state.flight)}</div>
        </div>
        { this.state.flight.stops.map(function (stop) {
        return  <div className="row">
                  <div className="col-xs-5 text-nowrap detail-col-left">○ Intermediate stop</div>
                  <div className="col-xs-2 detail-col">{ stop.code }</div>
                  <div className="col-xs-2 col-xs-offset-3 detail-col">{ stop.duration }</div>
                </div>
      })}
      </div>
    )
  }
});
