import React from 'react';
import { ActionsStore } from '../../functions.js';
import OrderPanelContainer from '../buy/OrderPanel.jsx';

var OrderPage = React.createClass({
  componentWillMount: function () {
    ActionsStore.updateNavBarPage('order');
  },

  render: function () {
    var specialOrder = this.props.params['specialOrder'] !== 'false';
    return (
      <OrderPanelContainer itineraryId={this.props.params['itineraryId']} specialOrder={specialOrder} />
    )
  }
});

export default OrderPage;
