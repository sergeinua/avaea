import React from 'react';
import StaticUnsupported from '../unsupported/Unsupported.jsx';
import Loader from '../../_common/Loader.jsx';
import { getUser } from '../../../functions.js';

let UnsupportedPage = React.createClass({

  getInitialState: function () {
    return {
      isLoading: false
    };
  },

  render: function () {
    return (
      <div>
        {
          this.state.isLoading === true ?
            <Loader/>
            :
            <StaticUnsupported user={getUser()||{}}/>
        }
      </div>
    )
  }
});

export default UnsupportedPage;
