import React from 'react';
import StaticPartner from '../partner/Partner.jsx';
import Loader from '../../_common/Loader.jsx';
import { getUser } from '../../../functions.js';

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
            <StaticPartner user={getUser()||{}}/>
        }
      </div>
    )
  }
});

export default PartnerPage;
