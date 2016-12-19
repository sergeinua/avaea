
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
						        <li className={this.props.location.pathname == '/home'? 'active':''}>{this.showLink("/home","Home")}</li>
						        <li className={this.props.location.pathname == '/about'? 'active':''}>{this.showLink("/about","About")}</li>
						        <li className={this.props.location.pathname == '/partner'? 'active':''}>{this.showLink("/partner","Partner")}</li>
						        <li className={this.props.location.pathname == '/contact'? 'active':''}>{this.showLink("/contact","Contact")}</li>
						      </ul>
	      			</nav>
	      			
	      			<div className="holder">
	      				<li >{this.showLink("/terms","Terms")}</li>
	      				<li >{this.showLink("/privacy","Privacy")}</li>
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



