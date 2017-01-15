import React from 'react';
import StaticPrivacy from '../privacy/Privacy.jsx';
import Loader from '../../_common/Loader.jsx';
import { getUser } from '../../../functions.js';

let PrivacyPage = React.createClass({

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
            <StaticPrivacy user={getUser()||{}}/>
        }
      </div>
    )
  }
});

export default PrivacyPage;
