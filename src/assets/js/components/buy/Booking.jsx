import React from 'react';
import ResultItemContainer from '../search/ResultItem';
import { ActionsStore } from '../../functions.js';
import moment from 'moment';

let Booking = React.createClass({
  getMarketingText: function () {
    let text;
    if (this.props.orderData.fieldsData.session.passengers.length == 1) {
      text = "Your trip is all set. The ticket has been issued as an electronic ticket.";
    } else {
      text = "Your trip is all set. The tickets have been issued as electronic tickets.";
    }
    return text + " Please check your email for confirmation.";
  },

  showPassengers: function () {
    let _passengers = [];
    for (let i = 1; i <= this.props.orderData.fieldsData.session.passengers; i++) {
      _passengers.push(<div className="name" key={"passenger-" + i}>
        {
          this.props.orderData.fieldsData['passengers['+i+'].FirstName']
          + ' ' +
          this.props.orderData.fieldsData['passengers['+i+'].LastName']
        }
      </div>);
    }
    return _passengers;
  },

  render: function () {
    let _mailto = this.props.orderData.replyTo.match(/(.*)<(.+)>/);

    // FIXME - had to hide logo for devices only when "flight-info" div is
    // showing in nav bar - this restores it
    $("body").removeClass('suppress-logo');

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
          <div className="thanks">Thank you for choosing OnVoya!</div>
          <div className="copy">
            {this.getMarketingText()}
          </div>
        </div>

        <div className="holder">
          <div className="trip ti">Passengers</div>
          <div className="passengers">

            <div className="wrapper">
              <span className="travel-dates">{moment(this.props.orderData.fieldsData.session.departureDate).format('MMM DD, YYYY')
              + (this.props.orderData.fieldsData.session.returnDate ?
                 moment(this.props.orderData.fieldsData.session.returnDate).format(' - MMM DD, YYYY')
                :
                '')}
              </span>
              <span className="class">{ActionsStore.defineCabinClass(this.props.orderData.itineraryData)}</span>
            </div>

            {this.showPassengers()}

          </div>
        </div>

        <div className="holder">
          <div className="trip ti">Itinerary</div>
          <div className="flight-unit">
            <div id="booked-flight-unit" className="booked-flight-unit">
              <ResultItemContainer key={this.props.orderData.itineraryData.id}  itinerary={this.props.orderData.itineraryData} showFullInfo={true}/>
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
