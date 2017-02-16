import React from 'react';

let Loader = React.createClass({

  render: function () {
    return <div className="page-loader">
	    	<div className="spinner-holder">
	      	<div className="icon-spinner"></div>
	    </div>
    </div>
  }
});

export default Loader;
