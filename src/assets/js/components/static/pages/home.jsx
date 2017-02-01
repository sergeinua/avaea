import React from 'react';
import StaticHome from '../home/Home.jsx';
import Loader from '../../_common/Loader.jsx';
import { getUser } from '../../../functions.js';

let HomePage = React.createClass({

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
            <StaticHome user={getUser()||{}}/>
        }
      </div>
    )
  }
});

export default HomePage;
