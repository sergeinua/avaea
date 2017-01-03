import React from 'react';
import StaticBlog from '../blog/Blog.jsx';
import Loader from '../../_common/Loader.jsx';
import { getUser } from '../../../functions.js';

let BlogPage = React.createClass({

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
            <StaticBlog user={getUser()||{}}/>
        }
      </div>
    )
  }
});

export default BlogPage;
