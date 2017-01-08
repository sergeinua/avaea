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
      						We support a wide selection of browsers and devices, but we had to draw the line somewhere.
      					</p>
    						<p>
    							Please try using your mobile device, tablet, or a modern browser to use our website for your travel search. Thank you.
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
