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

// engineer please make "Back" button on this panel go back to the edit view (OrderPanel.jsx)

let OrderPanelConfirm = React.createClass({


  render: function () {


      return (
        <span>
        
        <SearchBanner id="bookingModal" text="Booking your trip!"/>

          <div className="booking-confirm">

            <div className="flight-unit">
              <div className="booking-flight-unit">
                <ResultItemContainer key={this.props.orderData.itineraryData.id} itinerary={this.props.orderData.itineraryData} showFullInfo={true}/>
              </div>
            </div>

            <div className="form">

	            <div className="page-ti billing">Billing</div>
		            <div className="wrapper">
		            
		            </div>
	
	            <div className="page-ti people">Travellers</div>
		            <div className="wrapper">
		            
		            </div>
            
            </div>{/* ends form */}


            <div className="buttons duo">

	            {/* engineer - please create new logic for "continue" button
	            
	                1) refreshes and recalculates price, with adjustment for age 
	                2) goes to a "confirmation" view of the form
	                   --- this form is in OrderConfirmation.jsx but needs logic
	                   --- On "confirmation" view, user can "edit" (return to this view with form fields) 
	                       or complete purchase
	             */}
	            
	            <button id="booking_button" className="big-button">
	            	Edit
	            </button>
	            
	            {/* engineer please populate this button with the total for all the passengers*/}
	              <button id="complete_order_button" className="big-button">
	                Buy Tickets
	              </button>
	            
            
            </div>

            </div>{/* ends div.form */}
          </div>
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
