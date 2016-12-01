import React from 'react';

var Loader = React.createClass({

  render: function () {
    return <div className="spinner-holder">
      <div className="icon-spinner"></div>
    </div>
  }
});

export default Loader;
