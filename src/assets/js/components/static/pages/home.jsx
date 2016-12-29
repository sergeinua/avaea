import React from 'react';
import StaticHome from '../home/Home.jsx';
import Loader from '../../_common/Loader.jsx';

let HomePage = React.createClass({

  getInitialState: function () {
    return {
      isLoading: false
    };
  },

  componentWillMount: function () {
    analytics.page(this.props.location.pathname);
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
            <StaticHome user={this.getUser()||{}}/>
        }
      </div>
    )
  }
});

export default HomePage;
