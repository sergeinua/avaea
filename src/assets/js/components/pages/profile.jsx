var ProfilePage = React.createClass({
  componentWillMount: function () {
    ActionsStore.updateNavBarPage('profile');
  },

  render: function () {
    return (
      <ReactRedux.Provider store={clientStore}>
        <UserProfileContainer />
      </ReactRedux.Provider>
    )
  }
});
