import React from 'react';
import StaticPrivacy from '../privacy/Privacy.jsx';
import Loader from '../../_common/Loader.jsx';

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
            <StaticPrivacy/>
        }
      </div>
    )
  }
});

export default PrivacyPage;
