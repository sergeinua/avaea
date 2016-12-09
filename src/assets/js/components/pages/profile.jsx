import React from 'react';

var ProfilePage = React.createClass({
  componentWillMount: function () {
    ActionsStore.updateNavBarPage('profile');
  },

  render: function () {
    return (
      <UserProfileContainer />
    )
  }
});

export default ProfilePage;
