import React from 'react';
import * as ReactRedux from 'react-redux';
import { ActionsStore, setCookie } from '../../functions.js';
import UserProfileContainer from '../user/Profile.jsx';

let ProfilePage = React.createClass({
  componentWillMount: function () {
    if (!this.props.user) {
      setCookie('redirectTo', this.props.location.pathname, {expires: 300});
      window.location = '/login';
    } else {
      analytics.page(this.props.location.pathname);
      ActionsStore.changeForm('profile', false);
    }
  },

  componentWillReceiveProps: function(nextProps) {
    if (!nextProps.user) {
      setCookie('redirectTo', this.props.location.pathname, {expires: 300});
      window.location = '/login';
    }
  },

  render: function () {
    return (
      <UserProfileContainer />
    )
  }
});

const mapState = function(store) {
  return {
    user: store.userData,
  };
};

const ProfilePageContainer = ReactRedux.connect(mapState)(ProfilePage);

export default ProfilePageContainer;
