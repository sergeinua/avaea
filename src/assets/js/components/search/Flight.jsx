import React from 'react';
import { ActionsStore, createMarkup } from '../../functions.js';
import moment from 'moment';

let Flight = React.createClass({

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
            <div className="switch-loc">{ this.props.pair.stops[this.props.count - 1].code }</div>
            <div
              className="wait-time">{ this.props.pair.stops[this.props.count - 1].duration }</div>
          </div>:null
        }

        <div className="long-wrapper">
          <div className="long-date">{ moment(this.props.flight.from.date).format('dddd' + ', ' + 'MMMM DD') }</div>
          <div className="long-airline">{ this.props.flight.airline }</div>
        </div>

        <div className="row details info">
          <div className="col-xs-3 text-nowrap notable-text detail-col flight-no">
            <span
              className="itinerary-airline-icon"
              style={{backgroundPosition: "0 -" + ActionsStore.getIconSpriteMap()[this.props.flight.airlineCode] * 15 + "px"}}
              alt={ this.props.flight.airlineCode }
              title={ this.props.flight.airline }>
            </span>
            <span className="flightNumber">{this.props.flight.abbrNumber}</span>
          </div>
          <div className="col-xs-2 text-nowrap detail-col date">{ moment(this.props.flight.from.date).format('DD MMM') }</div>
          <div className="col-xs-2 text-nowrap detail-col dest">{ this.props.flight.from.code + '-' + this.props.flight.to.code }</div>
          <div className="col-xs-3 text-nowrap notable-text detail-col times">{ this.props.flight.from.time + '-' + this.props.flight.to.time }</div>
          <div className="col-xs-2 text-nowrap detail-col length">
            <span dangerouslySetInnerHTML={ createMarkup(this.props.flight.duration) }></span>
            {this.showNoStops(this.props.flight)}
          </div>
        </div>
        { this.props.flight.stops.map(function (stop, i) {
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

export default Flight;
