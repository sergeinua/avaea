import React from 'react';
import { ActionsStore } from '../../functions.js';
import OrderPanelContainer from '../buy/OrderPanel.jsx';
import { setCookie } from '../../legacyJquery.js';

let OrderPage = React.createClass({
  componentWillMount: function () {
    if (!this.getUser()) {
      setCookie('redirectTo', this.props.location.pathname, {expires: 300});
      window.location = '/login';
    } else {
      ActionsStore.changeForm('order', false);
    }
  },

  getUser: function () {
    return InitData.user || false;
  },

  render: function () {
    var specialOrder = this.props.params['specialOrder'] !== 'false';
    return (
      <OrderPanelContainer itineraryId={this.props.params['itineraryId']} specialOrder={specialOrder} />
    )
  }
});

export default OrderPage;
