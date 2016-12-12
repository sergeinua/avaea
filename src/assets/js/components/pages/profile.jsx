import React from 'react';
import { ActionsStore } from '../../functions.js';
import UserProfileContainer from '../user/Profile.jsx';

let ProfilePage = React.createClass({
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
