import React from 'react';
import StaticAbout from '../about/About.jsx';
import Loader from '../../_common/Loader.jsx';

let AboutPage = React.createClass({

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
            <StaticAbout user={this.getUser()||{}}/>
        }
      </div>
    )
  }
});

export default AboutPage;
