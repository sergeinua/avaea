var StaticHeader = React.createClass({
  render: function () {
    return (
      <header className="static">
        <nav>
	        <ul className="menu nav">
		        <li className={this.props.location.pathname == '/home'? 'active':''}><Link to="/home">Home</Link></li>
		        <li className={this.props.location.pathname == '/about'? 'active':''}><Link to="/about">About</Link></li>
		        <li className={this.props.location.pathname == '/news'? 'active':''}><Link to="/news">News</Link></li>
		        <li className={this.props.location.pathname == '/blog'? 'active':''}><Link to="/blog">Blog</Link></li>
		      </ul>  
		        
		      <ul className="menu user"> 
		        {this.props.user.email ?
		          <span>
		            <li><Link to="/search" className="flight-search">Flight Search</Link></li>
		            <li> <a href="/logout">Log out</a></li>
		          </span>
		          :
		          <li><a href="/login">Login</a></li>
		        }
		      </ul>
        </nav>
      </header>
    )
  }
});
