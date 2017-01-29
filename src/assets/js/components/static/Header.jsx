
import React from 'react';
import { Link } from 'react-router';


let StaticHeader = React.createClass({
	
	onItemClick: function (event) {
		if ($(".static-nav-button").is(':visible')) {
			$("header.static nav").toggleClass('respond');
		}
	},
	
	closeNav: function (event) {
		if ($(".static-nav-button").is(':visible')) {
			$("header.static nav").removeClass('respond');
		}
	},
	
  render: function () {
    return (
    		<header className="static">
        <div className="static-nav-button" onClick={this.onItemClick}></div>
        {/* logo managed by CSS for whitelabelling later */}
        <Link to="/search" className="brand" onClick={this.closeNav}></Link> 
          <nav>
          	<div className="left">
  		        <ul className="menu nav">
  		        	<li className={this.props.location.pathname == '/about'? 'active':''}><Link to="/about" onClick={this.onItemClick}>About</Link></li>
  			        <li className={this.props.location.pathname == '/team'? 'active':''}><Link to="/team" onClick={this.onItemClick}>Team</Link></li>
  			        <li className={this.props.location.pathname == '/contact'? 'active':''}><Link to="/contact" onClick={this.onItemClick}>Contact</Link></li>
  			      </ul>
  		      </div>
  		      
  		      <div className="right">  
  			      <ul className="menu user"> 
  			      	<li className="flight-search">
  			      		<Link to="/search" className="flight-search" onClick={this.onItemClick}>Flight Search</Link>
  			        </li>
  			        <li className="active"> 
  			        	<a href={this.props.user.email ? "/logout" : "/login"} onClick={this.onItemClick}>{this.props.user.email ? "Log Out" : "Log In"}</a>
  			        </li>
  			      </ul>
  		      </div>
  		      
          </nav>
        </header>
    )
  }
});

export default StaticHeader;
