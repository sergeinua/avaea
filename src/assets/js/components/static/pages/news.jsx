import React from 'react';
import StaticNews from '../news/News.jsx';
import Loader from '../../_common/Loader.jsx';

let NewsPage = React.createClass({

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
            <StaticNews/>
        }
      </div>
    )
  }
});

export default NewsPage;
