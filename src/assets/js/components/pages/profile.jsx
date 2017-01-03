import React from 'react';
import { ActionsStore, getUser, setCookie } from '../../functions.js';
import UserProfileContainer from '../user/Profile.jsx';

let ProfilePage = React.createClass({
  componentWillMount: function () {
    if (!getUser()) {
      setCookie('redirectTo', this.props.location.pathname, {expires: 300});
      window.location = '/login';
    } else {
      analytics.page(this.props.location.pathname);
      ActionsStore.changeForm('profile', false);
    }
  },

  render: function () {
    return (
      <UserProfileContainer />
    )
  }
});

export default ProfilePage;
