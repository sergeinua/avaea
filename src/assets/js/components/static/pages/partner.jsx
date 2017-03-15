import React from 'react';
import StaticPartner from '../partner/Partner.jsx';
import Loader from '../../_common/Loader.jsx';

let PartnerPage = React.createClass({

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
            <StaticPartner/>
        }
      </div>
    )
  }
});

export default PartnerPage;
