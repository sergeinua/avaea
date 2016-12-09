import React from 'react';

var PrivacyPage = React.createClass({

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
            <StaticPrivacy user={this.getUser()||{}}/>
        }
      </div>
    )
  }
});

export default PrivacyPage;
