import React from 'react';
import { Link } from 'react-router';

let StaticHeader = React.createClass({
  render: function () {
    return (
      <header className="static">
        <nav>
          <div className="left">
          <ul className="menu nav">
            <li className={this.props.location.pathname == '/home'? 'active':''}><Link to="/home">Home</Link></li>
            <li className={this.props.location.pathname == '/about'? 'active':''}><Link to="/about">About</Link></li>
            <li className={this.props.location.pathname == '/news'? 'active':''}><Link to="/news">News</Link></li>
            {/* add partner with us */}
            <li className={this.props.location.pathname == '/contact'? 'active':''}><Link to="/contact">Contact</Link></li>
          </ul>
          </div>

          <div className="right">
            <ul className="menu user">
              {this.props.user.email ?
                <span>
                  <li className="flight-search"><Link to="/search" className="flight-search">Flight Search</Link></li>
                  <li className="active"> <a href="/logout">Log out</a></li>
                </span>
                :
                <li className="active"><a href="/login">Login</a></li>
              }
            </ul>
          </div>
        </nav>
      </header>
    )
  }
});

export default StaticHeader;
