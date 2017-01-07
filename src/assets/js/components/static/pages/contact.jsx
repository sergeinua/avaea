import React from 'react';
import StaticContact from '../contact/Contact.jsx';
import Loader from '../../_common/Loader.jsx';
import { getUser } from '../../../functions.js';

let ContactPage = React.createClass({

  getInitialState: function () {
    return {
      isLoading: false
    };
  },

  componentWillMount: function () {
    analytics.page(this.props.location.pathname);
  },

  render: function () {
    return (
      <div>
        {
          this.state.isLoading === true ?
            <Loader/>
            :
            <StaticContact user={getUser()||{}}/>
        }
      </div>
    )
  }
});

export default ContactPage;
