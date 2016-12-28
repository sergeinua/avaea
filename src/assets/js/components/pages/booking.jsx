import React from 'react';
import 'whatwg-fetch';
import 'promise-polyfill';
import { ActionsStore } from '../../functions.js';
import Loader from '../_common/Loader.jsx';
import Booking from '../buy/Booking.jsx';
import { setCookie } from '../../legacyJquery.js';

let BookingPage = React.createClass({

  getInitialState: function () {
    return {
      bookingId: this.props.params['bookingId'] || 0,
      isLoading: true,
      orderData: null,
    };
  },

  getUser: function () {
    return InitData.user || false;
  },

  componentWillMount: function () {
    if (!this.getUser()) {
      setCookie('redirectTo', this.props.location.pathname, {expires: 300});
      window.location = '/login';
    }
    ActionsStore.changeForm('about', false);
    analytics.page(this.props.location.pathname);
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
      })
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
