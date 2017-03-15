import React from 'react';
import StaticUnsupported from '../unsupported/Unsupported.jsx';
import Loader from '../../_common/Loader.jsx';

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
            <StaticUnsupported/>
        }
      </div>
    )
  }
});

export default UnsupportedPage;
