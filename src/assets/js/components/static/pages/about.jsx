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

  render: function () {
    return (
      <div>
        {
          this.state.isLoading === true ?
            <Loader/>
            :
            <StaticAbout/>
        }
      </div>
    )
  }
});

export default AboutPage;
