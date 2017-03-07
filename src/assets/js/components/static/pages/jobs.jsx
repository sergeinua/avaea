import React from 'react';
import StaticJobs from '../jobs/Jobs.jsx';
import Loader from '../../_common/Loader.jsx';

let JobsPage = React.createClass({

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
            <StaticJobs/>
        }
      </div>
    )
  }
});

export default JobsPage;
