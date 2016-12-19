var ProfilePage = React.createClass({
  componentWillMount: function () {
    ActionsStore.changeForm('profile', false);
  },

  render: function () {
    return (
      <UserProfileContainer />
    )
  }
});
