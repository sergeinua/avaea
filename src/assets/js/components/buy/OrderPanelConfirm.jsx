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

            <div className="form">

	            <div className="page-ti billing">Billing</div>
	            <div className="wrapper billing">
	            
	            	<div className="name static">FirstName LastName</div>
		            
		            <div className="address static">
		            		<div className="street1">Address Street</div>
		            		<div>
			            		<span className="city">City</span>, 
			            		<span className="state">CA</span>
			            		<span className="zip-code">00000</span>
		            		</div>
		            		<div className="country">United States</div>
		            </div>
		            
		            <div className="payment static">
		            	<span className="card-type">American Express</span>
		            	<span className="copy"> ending in </span>
		            	<span className="last-4">1234</span>
		            </div>
		            
	            </div>{/* ENDS billing wrapper */}
	
	            <div className="page-ti people">Travellers</div>
		            <div className="wrapper people">
		            
			            {/* engineer -- each passenger (loop) */}
		            	
			            <div className="card passenger-loop">
				            
					            <div className="which-passenger">FirstName LastName</div>
					            
					            <div className="gender static">
					            	<span className="label-no-bs">Gender</span>
					            	<span className="value">Male</span>
					            </div>
					            
					            <div className="birthday static">
						            <span className="label-no-bs">Birthday</span>
						            {/* engineer -- display long date format */}
					            	<span className="value">September 29, 2008</span>
					            </div>
					            
					            {/* engineer -- include IF birthday is < 2 years OR 2-12 years OR > 65 years */}
					            <div className="passenger-type static">
						            <span className="label-no-bs">Passenger Type</span>
						            {/* engineer -- 
				                            if <2 years, "Infant"
				                            if 2-12 years, "Child"
				                            if >65 years, "Senior"
                         */}
					            	<span className="value">Infant</span>
					            </div>
					            
					            {/* engineer -- include IF birthday is < 2 years */}
					            <div className="lap-seat static">
						            <span className="label-no-bs">Infant Seat Type</span>
					            	<span className="value">Lap infant</span>
					            </div>
					            
					            <div className="phone static">
						            <span className="label-no-bs">Telephone</span>
					            	<span className="value">(803) 754-5818</span>
					            </div>
					            
					            <div className="passenger-price static">
						            <span className="label-no-bs">Ticket Price</span>
					            	<span className="value">$NNN.NN</span>
					            </div>
					            
					            {/* engineer -- include IF (price is different from adult price) AND IF (it is less than adult price) */}
					            <div className="passenger-discount">
					            
					            	{/* engineer -- fill in Airline name */}
					            	<span className="airline">Delta Airlines</span> 
					            		<span className="copy">  has provided a </span>
					            		
					            	{/* engineer -- fill in $ discount amount */}
					            	<span className="discount">$NNN.NN</span>
					            		<span className="copy"> discount for this </span>
					            		
					            	{/* engineer -- fill type of age discount
																if <2 years, "Infant"
		                            if 2-12 years, "Child"
		                            if >65 years, "Senior"
                        */}
					            	<span className="age-discount">Senior</span> 
					            		<span className="copy">  ticket.</span>
					            		
					            </div>
				            
				            </div>{/* ENDS each passenger (loop) */}
				            
			            
			            <div className="totals">
		              
			              {/* engineer -- populate value with "N" (total passengers) */}
			              <div className="tickets">
				              <span className="label-no-bs">Tickets</span>
				            	<span className="value">N</span>
			            	</div>
				            
			            	{/* engineer -- populate value with exact total calculated $$ for all passengers */}
			            	<div className="cost">
				            	<span className="label-no-bs">Total Cost</span>
				            	<span className="value">$NNN.NN</span>
				            </div>
			            
			            </div>
		            
		            </div>{/* ENDS people wrapper */}
		            
		          </div>{/* ENDS div.form */}

            <div className="buttons duo">

	            <button id="edit_order_button" className="big-button secondary">
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
