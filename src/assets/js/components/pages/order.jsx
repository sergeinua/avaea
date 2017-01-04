import React from 'react';
import { ActionsStore, getUser, setCookie } from '../../functions.js';
import OrderPanelContainer from '../buy/OrderPanel.jsx';

let OrderPage = React.createClass({
  componentWillMount: function () {
    if (!getUser()) {
      setCookie('redirectTo', this.props.location.pathname, {expires: 300});
      window.location = '/login';
    } else {
      analytics.page(this.props.location.pathname);
      ActionsStore.changeForm('order', false);
    }
  },

  render: function () {
    var specialOrder = this.props.params['specialOrder'] !== 'false';
    return (
      <OrderPanelContainer itineraryId={this.props.params['itineraryId']} specialOrder={specialOrder} />
    )
  }
});

export default OrderPage;
