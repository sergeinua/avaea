import React from 'react';
import { ActionsStore } from '../../functions.js';
import UserProfileContainer from '../user/Profile.jsx';
import { setCookie } from '../../legacyJquery.js';

let ProfilePage = React.createClass({
  componentWillMount: function () {
    if (!this.getUser()) {
      setCookie('redirectTo', this.props.location.pathname, {expires: 300});
      window.location = '/login';
    } else {
      analytics.page(this.props.location.pathname);
      ActionsStore.changeForm('profile', false);
    }
  },

  getUser: function () {
    return InitData.user || false;
  },

  render: function () {
    return (
      <UserProfileContainer />
    )
  }
});

export default ProfilePage;
