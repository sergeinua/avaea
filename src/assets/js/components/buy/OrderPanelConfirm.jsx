import React from 'react';
import * as ReactRedux from 'react-redux';
import ClientApi from '../_common/api.js';
import DisplayAlert from '../_common/DisplayAlert.jsx';
import SearchBanner from '../searchform/SearchBanner.jsx';
import {actionLoadOrderSuccess, actionLoadOrderFailed} from '../../actions.js';
import { browserHistory, hashHistory } from 'react-router';
import { supportsHistory } from 'history/lib/DOMUtils';
const historyStrategy = supportsHistory() ? browserHistory : hashHistory;
import { ActionsStore } from '../../functions.js';

// engineer -- please make "Back" button on this panel go back to the edit view (OrderPanel.jsx)

let OrderPanelConfirm = React.createClass({


  render: function () {


      return (
        <span>
        
        	<SearchBanner id="bookingModal" text="Booking your trip!"/>

          <div className="confirming booking">

            <div className="flight-unit">
              <div className="booking-flight-unit">
                <ResultItemContainer key={this.props.orderData.itineraryData.id} itinerary={this.props.orderData.itineraryData} showFullInfo={true}/>
              </div>
            </div>

            <div className="holder">

	            <div className="page-ti billing">Billing</div>
	            <div className="wrapper billing">
	            
	            	<div className="name static">Indiana Jones</div>
		            
		            <div className="address static">
		            		<div className="street1">2020 Campus History Building</div>
		            		<span className="city">Boston</span>, 
		            		<span className="state">MA</span>
		            		<span className="zip-code">02215</span>
		            		<div className="country">United States</div>
		            </div>
		            
		            <div className="payment static">
		            	<span className="card-type">American Express</span>
		            	<span className="copy"> with last 4 digits ending in </span>
		            	<span className="last-4">1234</span>
		            </div>
		            
	            </div>{/* ENDS billing wrapper */}
	
	            <div className="page-ti people">Travellers</div>
		            <div className="wrapper people">
		            
			            {/* engineer -- each passenger (loop) */}
			            
			            
			            <div className="which-passenger">FirstName LastName</div>
			            <div className="gender static">Male</div>
			            <div className="birthday static">November 9, 1977</div>
			            
			            {/* engineer -- include IF birthday is < 2 years */}
			            <div className="lap-seat static">Seat infant</div>
			            
			            <div className="phone static">Seat infant</div>
			            
			            {/* ENDS each passenger (loop) */}
		            
		            </div>{/* ENDS people wrapper */}
            
		            <div className="price-confirm">
		            
			            {/* engineer -- populate this div with "N" and exact total calculated $$ for all passengers */}
			            <span>N </span>tickets for <span> $NNN.NN</span>
		            
		            </div>
		            
		          </div>{/* ENDS holder */}

            <div className="buttons duo">

	            <button id="booking_button" className="big-button">
	            	{/* engineer -- "Edit" returns to OrderPanel.jsx editable form */}
	            	Edit
	            </button>
	            
              <button id="complete_order_button" className="big-button">
                Buy Tickets
              </button>
                
  	            {/* 
  		            ----- old button for price ----- 
  		            
  		            <button id="booking_button" className="big-button" onClick={this.execReq}>
  	                {this.props.orderData.itineraryData.orderPrice}
  	              </button>
  		              
  		          */}
            
            </div>{/* ENDS buttons */}

          </div>{/* ENDS confirming booking */}
        </span>

      );
    } else {
      if (this.props.orderData.action) {
        console.error('Unknown api action', this.props.orderData.action);
        return <DisplayAlert />;
      } else {
        return <Loader/>
      }
    }
  }

});


let OrderPanelConfirmContainer = ReactRedux.connect(OrderPanelConfirm);

export default OrderPanelConfirmContainer;
