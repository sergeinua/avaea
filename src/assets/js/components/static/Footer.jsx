
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
				      			<li className={this.props.location.pathname == '/home'? 'active':''}><Link to="/home" onClick={this.onItemClick}>Home</Link></li>
		  			        <li className={this.props.location.pathname == '/about'? 'active':''}><Link to="/about" onClick={this.onItemClick}>About</Link></li>
		  			        <li className={this.props.location.pathname == '/contact'? 'active':''}><Link to="/contact" onClick={this.onItemClick}>Contact</Link></li>
						      </ul>
	      			</nav>
	      			
	      			<div className="holder">
	      				<ul className="terms">
		      				<li><Link to="/terms" onClick={this.onItemClick}>Terms and Conditions</Link></li>
		      				<li><Link to="/privacy" onClick={this.onItemClick}>Privacy</Link></li>
	      				</ul>
	      			</div>
	      		</div>{/* ends left */}
	      		
	      		<div className="right">
	      			<a className="social fb" href="http://www.facebook.com/onvoya" target="_blank"></a>
	      			<a className="social twitter" href="http://www.twitter.com/onvoyatravel" target="_blank"></a>
	      			<a className="social instagram" href="http://www.instagram.com/onvoya" target="_blank"></a>
	      		</div>{/* ends right */}
	      		
	      	</div>{/* ends wrapper */}
      	</div>{/* ends top */}
      	
      	<div className="bottom">
        	<span className="copyright">{(' ' + d.getFullYear() + ' Onvoya.com')}</span>
        </div>	
      </footer>
    )
  }

});

export default StaticFooter;



