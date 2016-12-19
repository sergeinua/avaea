import React from 'react';
import ResultItem from '../search/ResultItem';

let Booking = React.createClass({
  render: function () {
    var _mailto = this.props.orderData.replyTo.match(/(.*)<(.+)>/);

    return (
      <div className="booking-success">

        <div className="e-ticket confirmation">
          <div className="confirm-code">
            <div className="success ti">Booking</div>
            <div className="wrapper">
              <span className="label-ti">Reservation Code:</span>
              <span className="number">{this.props.orderData.bookingRes.PNR}</span>
            </div>
          </div>
        </div>

        <div className="confirm-message">
          <div className="name">Dear&nbsp;{this.props.orderData.fieldsData.FirstName} {this.props.orderData.fieldsData.LastName},</div>
          <div className="thanks">Thank you for choosing Avaea!</div>
          <div className="copy">
            You're all set for your next trip. Your ticket has been issued as an electronic ticket.
            Please check your email for confirmation.
          </div>
        </div>

        <div className="trip ti">Trip Details</div>
        <div className="flight-unit">
          <div id="booked-flight-unit" className="booked-flight-unit">
            <ResultItem key={this.props.orderData.itineraryData.id}  itinerary={this.props.orderData.itineraryData} showFullInfo={true}/>
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
