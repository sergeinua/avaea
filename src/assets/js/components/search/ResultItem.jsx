import React from 'react';
import Citypairs from './Citypairs.jsx';
import ModalFlightInfo from './ModalFlightInfo.jsx';
import { browserHistory } from 'react-router';
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
      this.getMilesInfo();
      this.getRefundType();
    }
  },

  getMilesInfo: function () {
    ActionsStore.getMilesInfoAllItineraries();
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

  showThumbsUp: function() {
    if (this.props.itinerary.smartRank <= 3 && this.props.itinerary.information && this.props.itinerary.information.length) {
      return <span data-toggle="modal" data-target={'[data-id=' + this.props.itinerary.id + ']'}><ModalFlightInfo id={this.props.itinerary.id} info={this.props.itinerary}/>
        {/* remove extras until we have real ones to show */}
        {/* <span className="extras-flag"></span> */}
      </span>
    }
    return null;
  },

  showNoStops: function(pair) {
    if (pair.noOfStops > 0) {
      return <span className="arr-connects"><span className="connections">{pair.noOfStops}</span></span>
    }
    return <span className="arr-connects-none"></span>
  },

  handleBuyButton: function(itineraryId, isSpecial) {
    return function() {
      if (!getUser()) {
        setCookie('redirectTo', '/order/' + itineraryId + '/' + (!!isSpecial), {expires: 300});
        window.location = '/login';
      } else {
        browserHistory.push('/order/' + itineraryId + '/' + (!!isSpecial));
      }
    }.bind(this);
  },

  render() {
    var showNoStops = this.showNoStops;
    return (
      <div id={"container-" + this.props.itinerary.id} className={"col-xs-12 itinerary " + this.props.itinerary.filterClass}>

    <div className="summary">
      <div className="row title">
        <div className="col-xs-12 itinerary-airline col-from-to">
          <span className="itinerary-airline-icon"
                style={{backgroundPosition: "0 -" + ActionsStore.getIconSpriteMap()[this.props.itinerary.citypairs[0].from.airlineCode] * 15 + "px"}}
                alt={ this.props.itinerary.citypairs[0].from.airlineCode }
                title={ this.props.itinerary.citypairs[0].from.airline }>
          </span>
          <span className="airline-text">{ this.props.itinerary.citypairs[0].from.airline }</span>
          {/* remove extras until we have real ones to show */}
          {/* {this.showThumbsUp()} */}
          <span className="static-price">{this.showPrice()}</span>
        </div>
      </div>

      <div className="row">
        <div className="col-xs-9"  id={ this.props.itinerary.id } onClick={this.toggleFullInfo()}>
          { this.props.itinerary.citypairs.map(function (pair, i) {
          return <div className="itinerary-info" key={"itin-info-" +  i}>
            <div className="col-xs-3 departLoc">
              {pair.from.time + ' ' + pair.from.code}</div>
            <div className="col-xs-2 connections text-center">{showNoStops(pair)}</div>
            <div className="col-xs-3 arriveLoc">{ pair.to.time + ' ' + pair.to.code }</div>
            <div className="col-xs-3 duration" dangerouslySetInnerHTML={ createMarkup(pair.duration) }></div>
          </div>
          }) }
        </div>

        <div className="col-xs-3 buy-button">
          <div className="btn-group text-nowrap buy-button-group">
            <button id={"buy-button-" + this.props.itinerary.id } className="btn btn-sm btn-primary buy-button-price" onClick={this.handleBuyButton(this.props.itinerary.id, false)}>{this.showPrice()}</button>
            <button type="button" className="btn btn-sm btn-primary dropdown-toggle buy-button-arrow" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              <span className="caret"></span>
            </button>
            <ul className="dropdown-menu">
              <li><a id={ "buy-cron-button-" + this.props.itinerary.id } href="#" onClick={this.handleBuyButton(this.props.itinerary.id, true)} className="our-dropdown text-center">or better</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    { (this.state.fullinfo ?
      <Citypairs citypairs={this.props.itinerary.citypairs}
                 information={this.props.itinerary.information}
                 miles={this.props.miles}
                 refundType={this.state.refundType} />
      : null
    )}

  </div>
    )
  }

});

export default ResultItem;
