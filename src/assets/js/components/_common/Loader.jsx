import React from 'react';

let Loader = React.createClass({

  render: function () {
    return <div className="spinner-holder">
      <div className="icon-spinner"></div>
    </div>
  }
});

export default Loader;
