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
          <div className="wrapper change-planes">
            <span className="direction">Change Planes</span>
            <span className="switch-loc">{ this.props.pair.stops[this.props.count - 1].code }</span>
            <span className="duration">{ this.props.pair.stops[this.props.count - 1].duration }</span>
          </div>
          :
         <div className="wrapper long-date">
          <span className="direction">{ this.props.pair.direction }</span>
        	<span className="date">{ moment(this.props.flight.from.date).format('dddd' + ', ' + 'MMMM DD') }</span>
        </div>
        }
        
        <div className="wrapper airline">
        <span
	        className="airline-icon"
	        style={{backgroundPosition: "0 -" + ActionsStore.getIconSpriteMap()[this.props.flight.airlineCode] * 15 + "px"}}
	        alt={ this.props.flight.airlineCode }
	        title={ this.props.flight.airline }>
	      </span> 
	      <span className="airline-text">{ this.props.flight.airline }</span>
	      <span className="airline-text">{this.props.flight.abbrNumber}</span>
        
        </div>

        <div className="wrapper detail-info">

          <span className="departTime">{ this.props.flight.from.time }</span>
          <span className="departLoc">{ this.props.flight.from.code }</span>
          <span className="arr-connects"></span>
          <span className="arriveTime">{ this.props.flight.to.time }</span>
          <span className="arriveLoc">{ this.props.flight.to.code }</span>
          <span className="duration">
            <span dangerouslySetInnerHTML={ createMarkup(this.props.flight.duration) }></span>
            {this.showNoStops(this.props.flight)}
          </span>
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
