import React from 'react';
import * as ReactRedux from 'react-redux';
import Citypairs from './Citypairs.jsx';
import { browserHistory, hashHistory } from 'react-router';
import { supportsHistory } from 'history/lib/DOMUtils';
const historyStrategy = supportsHistory() ? browserHistory : hashHistory;
import { ActionsStore, logAction, createMarkup, getUser, setCookie } from '../../functions.js';
import ClientApi from '../_common/api.js';

let ResultItem = React.createClass({
  getInitialState: function() {
    return {
      fullinfo: this.props.showFullInfo || false,
      refundType: false
    };
  },

  componentDidMount: function () {
    if (this.state.fullinfo) {
      this.getRefundType();
    } else {
    	this.getMilesInfo();
    }
  },

  // start loading miles info if needed
  getMilesInfo: function () {
    let itineraryId = this.props.itinerary.id;

    let itineraryMiles = this.props.ffmiles[itineraryId];
    if (itineraryMiles === undefined
      || itineraryMiles.isLoading === false
    ) {
      let ids = [];
      if (ActionsStore.getSearchResultItineraryIds) {
        ids = ActionsStore.getSearchResultItineraryIds();
      }
      if (ids.indexOf(itineraryId) == -1) {
        ids.push(itineraryId);
      }
      ActionsStore.loadMilesInfo(ids);
    }
  },

  getRefundType: function () {
    if (this.state.refundType !== false) return;
    var refundType = 'N/A';

    ClientApi.reqPost('/ac/getRefundType?id=' + this.props.itinerary.id, null, true)
      .then((msg) => {
        if( !msg.error && msg.value ) {
          refundType = msg.value;
        }
        if (this.isMounted()) {
          this.setState({
            refundType: refundType
          });
        }
      })
      .catch((error) => {
        if (this.isMounted()) {
          this.setState({
            refundType: refundType
          });
        }
        console.error(error);
      });
  },
  
  
  toggleFullInfo: function () {
    var itineraryId = this.props.itinerary.id;
    return function() {
      var newVal = !this.state.fullinfo;
      this.setState({fullinfo: newVal});

      if (newVal) {
        this.getMilesInfo();
        this.getRefundType();

        logAction('on_itinerary_purchase', {
          action: 'itinerary_expanded',
          itinerary: {
            id: itineraryId
          }
        });
      }

    }.bind(this);
  },

  showPrice: function () {
    if (this.props.itinerary.currency == 'USD') {
      return '$' + Math.round(this.props.itinerary.price);
    } else {
      return Math.round(this.props.itinerary.price) + ' ' +  this.props.itinerary.currency;
    }
  },
  
  showMilesPrice: function () {
  	return ' ~$' + Math.round((this.props.itinerary.miles)*.02);
  },

  showNoStops: function(pair) {
    if (pair.noOfStops > 0) {
      return <span className="arr-connects"><span>{pair.noOfStops}</span></span>
    }
    return <span className="arr-connects-none"></span>
  },

  handleBuyButton: function(itineraryId, isSpecial) {
    return function(e) {
      e.stopPropagation();
      historyStrategy.push('/order/' + itineraryId + '/' + (!!isSpecial));
    }.bind(this);
  },
  
  render() {
    var showNoStops = this.showNoStops;
    return (
      <div id={"container-" + this.props.itinerary.id} className={"itinerary " + this.props.itinerary.filterClass} onClick={this.toggleFullInfo()}>

      <div className="summary top-row">
      	<div className="wrapper airline">
	        <span className="airline-icon"
	              style={{backgroundPosition: "0 -" + ActionsStore.getIconSpriteMap()[this.props.itinerary.citypairs[0].from.airlineCode] * 15 + "px"}}
	              alt={ this.props.itinerary.citypairs[0].from.airlineCode }
	              title={ this.props.itinerary.citypairs[0].from.airline }>
	        </span>
	        <span className="airline-text">{ this.props.itinerary.citypairs[0].from.airline }</span>
	        <span className="provider">via Travelocity{/* engineer - please populate with provider name */}</span>
	        
        </div>
	      <div className="wrapper buy-button" onClick={this.handleBuyButton(this.props.itinerary.id, false)}>   
	      	<span className="price">{this.showPrice()}</span>
	        <button id={"buy-button-" + this.props.itinerary.id } className="buy-button-itin">Buy</button>
	      </div>
      </div>{/* ends top row */}
      

      <div className="summary short-itin"  id={ this.props.itinerary.id }>
        { this.props.itinerary.citypairs.map(function (pair, i) {
        return <div className="itinerary-info" key={"itin-info-" +  i}>
          <span className="departTime">{pair.from.time}</span>
          <span className="departLoc">{pair.from.code}</span>
          <span className="connections">{showNoStops(pair)}</span>
          <span className="arriveTime">{ pair.to.time}</span>
          <span className="arriveLoc">{ pair.to.code}</span>
          <span className="duration" dangerouslySetInnerHTML={ createMarkup(pair.duration) }></span>
        </div>
        }) }
      </div>

    { (this.state.fullinfo ?
      <Citypairs citypairs={this.props.itinerary.citypairs}
                 information={this.props.itinerary.information}
                 miles={this.props.ffmiles[this.props.itinerary.id]}
                 refundType={this.state.refundType} />
      : null
    )}
    
    {/* engineer --
        include IF there are extras OR fF miles */}
    <div className="itinerary-value-bar">		
    
      {/* include IF free wireless, bag, lounge or priority boarding */}
			<div className="extras">
				<span className="copy">Extras </span>
				{/* populate with total value of free extras */}
				<span className="amount">$56</span>		
				
				{/* include extra if it exists */}
				<span className="extra wireless"></span>		
				<span className="extra baggage"></span>	
				<span className="extra lounge"></span>	
				<span className="extra priority"></span>		
			</div>		
					
			{/* include IF ff miles */}
			<div className="ff-value">		
				<span className="how-many">
					{/* engineer - 
					    please abbreviate any round thousand miles as NK
					    for example, 10,000 as "10K"
					 */}
					{this.props.itinerary.miles} Miles
				</span>		
				
				{/* number of miles x $.02 
				    '~$' + (miles.value.rounded)  *.02 - then round this off to nearest $ amount
				*/}		
				<span className="value">{this.showMilesPrice()}</span>		
			</div>		
			
		</div>{/* ends itinerary value bar */}

  </div>
    )
  }

});

const mapStateCommon = function (store) {
  return {
    ffmiles: store.commonData.ffmiles,
  };
};


const ResultItemContainer = ReactRedux.connect(mapStateCommon)(ResultItem);

export default ResultItemContainer;
