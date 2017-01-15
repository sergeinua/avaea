import React from 'react';
import { ActionsStore, getUser, setCookie } from '../../functions.js';
import UserProfileContainer from '../user/Profile.jsx';

let ProfilePage = React.createClass({
  componentWillMount: function () {
  	// FIXME - had to hide logo for devices only when "flight-info" div is 
  	// showing in nav bar - this restores it
  	$("body").removeClass('suppress-logo');
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
