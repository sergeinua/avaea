import React from 'react';
import StaticPartner from '../partner/Partner.jsx';
import Loader from '../../_common/Loader.jsx';

let PartnerPage = React.createClass({

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
            <StaticPartner user={this.getUser()||{}}/>
        }
      </div>
    )
  }
});

export default PartnerPage;