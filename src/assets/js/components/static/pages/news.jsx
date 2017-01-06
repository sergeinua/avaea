import React from 'react';
import StaticNews from '../news/News.jsx';
import Loader from '../../_common/Loader.jsx';
import { getUser } from '../../../functions.js';

var NewsPage = React.createClass({

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
            <StaticNews user={getUser()||{}}/>
        }
      </div>
    )
  }
});

export default NewsPage;
