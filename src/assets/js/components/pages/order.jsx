import React from 'react';

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
