var OrderPage = React.createClass({
  componentWillMount: function () {
    ActionsStore.updateNavBarPage('order');
  },

  render: function () {
    var specialOrder = this.props.params['specialOrder'] !== 'false';
    return (
      <ReactRedux.Provider store={clientStore}>
        <OrderPanelContainer itineraryId={this.props.params['itineraryId']} specialOrder={specialOrder} />
      </ReactRedux.Provider>
    )
  }
});
