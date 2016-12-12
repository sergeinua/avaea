import React from 'react';
import StaticNews from '../news/News.jsx';
import Loader from '../../_common/Loader.jsx';

var NewsPage = React.createClass({

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
            <StaticNews user={this.getUser()||{}}/>
        }
      </div>
    )
  }
});

export default NewsPage;
