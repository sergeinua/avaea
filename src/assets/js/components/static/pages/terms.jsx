import React from 'react';
import StaticTerms from '../terms/Terms.jsx';
import Loader from '../../_common/Loader.jsx';
import { getUser } from '../../../functions.js';

let TermsPage = React.createClass({

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
            <StaticTerms user={getUser()||{}}/>
        }
      </div>
    )
  }
});

export default TermsPage;
