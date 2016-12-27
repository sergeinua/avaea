import React from 'react';
import StaticTerms from '../terms/Terms.jsx';
import Loader from '../../_common/Loader.jsx';

let TermsPage = React.createClass({

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
            <StaticTerms user={this.getUser()||{}}/>
        }
      </div>
    )
  }
});

export default TermsPage;
