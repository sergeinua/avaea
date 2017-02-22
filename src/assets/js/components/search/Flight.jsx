import React from 'react';
import { ActionsStore, createMarkup } from '../../functions.js';
import moment from 'moment';

let Flight = React.createClass({

  showNoStops: function(flight) {
    if (flight.noOfStops > 0) {
      return <span className="text-danger">{'+' + flight.noOfStops + (parseInt(flight.noOfStops) > 1 ? ' stops' : ' stop')}</span>
    }
    return null;
  },

  render: function() {
    return (
      <div className="details">
        { this.props.count?
          <div className="switch-planes">
            <div className="change-planes">Change planes</div>
            <div className="switch-loc">{ this.props.pair.stops[this.props.count - 1].code }</div>
            <div
              className="wait-time">{ this.props.pair.stops[this.props.count - 1].duration }</div>
          </div>:null
        }

        <div className="wrapper">
          <div className="long-date">{ moment(this.props.flight.from.date).format('dddd' + ', ' + 'MMMM DD') }</div>
          <div className="long-airline">{ this.props.flight.airline }</div>
        </div>

        <div className="wrapper">
          <span
            className="airline-icon"
            style={{backgroundPosition: "0 -" + ActionsStore.getIconSpriteMap()[this.props.flight.airlineCode] * 15 + "px"}}
            alt={ this.props.flight.airlineCode }
            title={ this.props.flight.airline }>
          </span>
          <span className="airline-text">{this.props.flight.abbrNumber}</span>

          <div className="date">{ moment(this.props.flight.from.date).format('DD MMM') }</div>
          <div className="dest">{ this.props.flight.from.code + '-' + this.props.flight.to.code }</div>
          <div className="times">{ this.props.flight.from.time + '-' + this.props.flight.to.time }</div>
          <div className="length">
            <span dangerouslySetInnerHTML={ createMarkup(this.props.flight.duration) }></span>
            {this.showNoStops(this.props.flight)}
          </div>
        </div>
        { this.props.flight.stops.map(function (stop, i) {
        return  <div key={i} className="stops">
                  <div className="ti">Intermediate stop</div>
                  <span>{ stop.code }</span>
                  <span>{ stop.duration }</span>
                </div>
      })}
      </div>
    )
  }
});

export default Flight;
