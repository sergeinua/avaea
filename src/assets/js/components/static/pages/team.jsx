import React from 'react';
import StaticTeam from '../team/Team.jsx';
import Loader from '../../_common/Loader.jsx';

let TeamPage = React.createClass({

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
            <StaticTeam/>
        }
      </div>
    )
  }
});

export default TeamPage;
