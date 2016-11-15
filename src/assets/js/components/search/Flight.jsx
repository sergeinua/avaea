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
    return null;
  },

  render: function() {
    return (
      <div className="details">
        { this.props.count?
          <div className="row switch-planes">
            <div className="detail-col change-planes">Change planes</div>
            <div className="switch-loc">{ this.state.pair.stops[this.props.count - 1].code }</div>
            <div
              className="wait-time">{ this.state.pair.stops[this.props.count - 1].duration }</div>
          </div>:null
        }

        <div className="long-wrapper">
          <div className="long-date">{ moment(this.state.flight.from.date).format('dddd' + ', ' + 'MMMM DD') }</div>
          <div className="long-airline">{ this.state.flight.airline }</div>
        </div>

        <div className="row details info">
          <div className="col-xs-3 text-nowrap notable-text detail-col flight-no">
            <span
              className="itinerary-airline-icon"
              style={{backgroundPosition: "0 -" + ActionsStore.getIconSpriteMap()[this.state.flight.airlineCode] * 15 + "px"}}
              alt={ this.state.flight.airlineCode }
              title={ this.state.flight.airline }>
            </span>
            <span className="flightNumber">{this.state.flight.abbrNumber}</span>
          </div>
          <div className="col-xs-2 text-nowrap detail-col date">{ moment(this.state.flight.from.date).format('DD MMM') }</div>
          <div className="col-xs-2 text-nowrap detail-col dest">{ this.state.flight.from.code + '-' + this.state.flight.to.code }</div>
          <div className="col-xs-3 text-nowrap notable-text detail-col times">{ this.state.flight.from.time + '-' + this.state.flight.to.time }</div>
          <div className="col-xs-2 text-nowrap detail-col length">
            <span dangerouslySetInnerHTML={ createMarkup(this.state.flight.duration) }></span>
            {this.showNoStops(this.state.flight)}
          </div>
        </div>
        { this.state.flight.stops.map(function (stop, i) {
        return  <div key={i} className="row stopovers">
                  <div className="col-xs-5 text-nowrap detail-col stopover">Intermediate stop</div>
                  <div className="col-xs-2 detail-col">{ stop.code }</div>
                  <div className="col-xs-2 col-xs-offset-2 detail-col">{ stop.duration }</div>
                </div>
      })}
      </div>
    )
  }
});
