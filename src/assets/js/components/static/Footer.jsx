
import React from 'react';
import { Link } from 'react-router';

let StaticFooter = React.createClass({
  render: function () {

    let d = new Date();
    return (
      <footer className="static">
      	
      	<div className="top">
	      	<div className="wrapper">
	      	
	      		<div className="left">
	      			<nav>
			      			<ul className="menu nav">
						        <li className={this.props.location.pathname == '/home'? 'active':''}><Link to="/home">Home</Link></li>
						        <li className={this.props.location.pathname == '/about'? 'active':''}><Link to="/about">About</Link></li>
						        <li className={this.props.location.pathname == '/partner'? 'active':''}><Link to="/partner">Partner</Link></li>
						        <li className={this.props.location.pathname == '/contact'? 'active':''}><Link to="/contact">Contact</Link></li>
						      </ul>
	      			</nav>
	      			
	      			<div className="holder">
		      			<Link to="/terms">Terms & Conditions</Link>
			          <Link to="/privacy">Privacy</Link>
	      			</div>
	      		</div>{/* ends left */}
	      		
	      		<div className="right">
	      			<a className="social fb" href="http://www.facebook.com/avaeatravel" target="_blank"></a>
	      			<a className="social twitter" href="http://www.twitter.com/avaeatravel" target="_blank"></a>
	      			<a className="social instagram" href="http://www.instagram.com/avaeatravel" target="_blank"></a>
	      		</div>{/* ends right */}
	      		
	      	</div>{/* ends wrapper */}
      	</div>{/* ends top */}
      	
      	<div className="bottom">
        	<span className="copyright">{(' ' + d.getFullYear() + ' Avaea.com')}</span>
        </div>	
      </footer>
    )
  }

});

export default StaticFooter;



