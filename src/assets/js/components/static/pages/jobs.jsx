import React from 'react';
import StaticJobs from '../jobs/Jobs.jsx';
import Loader from '../../_common/Loader.jsx';

let JobsPage = React.createClass({

  getInitialState: function () {
    return {
      isLoading: false
    };
  },

  getUser: function () {
    //FIXME get rid from global var
    return this.props.user || InitData.user || false;
  },

  render: function () {
    return (
      <div>
        {
          this.state.isLoading === true ?
            <Loader/>
            :
            <StaticJobs user={this.getUser()||{}}/>
        }
      </div>
    )
  }
});

export default JobsPage;
