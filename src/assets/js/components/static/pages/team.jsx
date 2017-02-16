import React from 'react';
import StaticTeam from '../team/Team.jsx';
import Loader from '../../_common/Loader.jsx';
import { getUser } from '../../../functions.js';

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
            <StaticTeam user={getUser()||{}}/>
        }
      </div>
    )
  }
});

export default TeamPage;
