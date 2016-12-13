var OrderPage = React.createClass({
  componentWillMount: function () {
    ActionsStore.changeForm('order', false);
  },

  render: function () {
    var specialOrder = this.props.params['specialOrder'] !== 'false';
    return (
      <OrderPanelContainer itineraryId={this.props.params['itineraryId']} specialOrder={specialOrder} />
    )
  }
});
