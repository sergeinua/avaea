import React from 'react';

let StaticUnsupported = React.createClass({
  render: function () {
    return (
      <div>
      	<div className="content static unsupported">
      		<div className="no-can-do">
      			<div className="unsupported-logo"></div>
      			<div className="unsupported-box">
      				<h1>Your browser is unsupported</h1>
      				<div className="copy">
      				
      					<p>
      						<strong>We support a wide selection of browsers and devices.</strong> While we're starting up,
      						it's crucial for us to develop features, and supporting older browsers means we 
      						would have to spend time accommodating out-of-date technology instead.
      					</p>
    						<p>
    							Please try using your mobile device, tablet, or a modern browser (we recommend Chrome) 
    							to use our website for your travel search. Thank you.
    						</p>
      				
      				</div>
      			</div>
      		</div>
      	</div>	
      </div>
    )
  }
});

export default StaticUnsupported;
