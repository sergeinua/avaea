import React from 'react';
import ResultItem from '../search/ResultItem';

let Booking = React.createClass({
  render: function () {
    var _mailto = this.props.orderData.replyTo.match(/(.*)<(.+)>/);

    return (
      <div className="booking-success">

        <div className="e-ticket confirmation">
          <div className="confirm-code">
            <div className="success ti">
              <span className="label-ti">Reservation Code:</span>
              <span className="number">{this.props.orderData.bookingRes.PNR}</span>
            </div>
          </div>
        </div>

        <div className="confirm-message">
          <div className="name">Dear&nbsp;{this.props.orderData.fieldsData.FirstName} {this.props.orderData.fieldsData.LastName},</div>
          <div className="thanks">Thank you for choosing Onvoya!</div>
          <div className="copy">
            
            {/* Vlad - need logic to show proper grammar for 1 passenger vs. >1 */}
            Your trip is all set. The (logic: one passenger? "ticket has" or "tickets have") been issued as 
            (logic: one passenger? "an" or "") electronic ticket(logic: one passenger? "" or "s").
            Please check your email for confirmation.
            
          </div>
        </div>
        
        <div className="holder">
        	<div className="trip ti">Passengers</div>
        	<div className="passengers">
        	
        		<div className="wrapper">
	        		{/* Vlad - date format should be Aug 16, 2016 - Aug 20, 2016 */}
	      			<span className="travel-dates">Mmm DD, YYYY - Mmm DD, YYYY</span>
	      			<span className="class">Class type</span>
        		</div>
        		
        		{/* Vlad - Firstname Lastname in the order they were entered on booking form */}
        		<div className="name">Firstname Lastname</div>
        	
        	</div>
        </div>
        
        <div className="holder">
	        <div className="trip ti">Itinerary</div>
	        <div className="flight-unit">
	          <div id="booked-flight-unit" className="booked-flight-unit">
	            <ResultItem key={this.props.orderData.itineraryData.id}  itinerary={this.props.orderData.itineraryData} showFullInfo={true}/>
	          </div>
	        </div>
        </div>

        <div className="help-contact">
            <span className="copy">Need help?&nbsp;
              <a href={'mailto:'+encodeURIComponent(_mailto[1])+_mailto[2]+'?subject='+encodeURIComponent('Booking Confirmation')}>Email Us</a>
              &nbsp;or call&nbsp;{this.props.orderData.callTo}
            </span>
        </div>

      </div>
    );
  }
});

export default Booking;
