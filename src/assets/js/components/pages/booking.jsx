import React from 'react';
import 'whatwg-fetch';
import 'promise-polyfill';
import { ActionsStore } from '../../functions.js';
import Loader from '../_common/Loader.jsx';
import Booking from '../buy/Booking.jsx';

let BookingPage = React.createClass({

  getInitialState: function () {
    return {
      bookingId: this.props.params['bookingId'] || 0,
      isLoading: true,
      orderData: null,
    };
  },

  componentWillMount: function () {
    analytics.page(this.props.location.pathname);
    ActionsStore.changeForm('about', false);

    fetch('/booking?bookingId=' + this.state.bookingId, {
      method: 'POST',
      credentials: 'same-origin' // required for including auth headers
    })
      .then((response) => response.json())
      .then((json) => {
        this.setState({
          isLoading: false,
          orderData: json
        });
      })
      .catch((error) => {
        console.log(error);
      });
  },

  render: function () {
    return (
      <div className="about">
        {
          this.state.isLoading === true ?
            <Loader/>
            : <Booking orderData={this.state.orderData}/>
        }
      </div>
    )
  }
});

export default BookingPage;
