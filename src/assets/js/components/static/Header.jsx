var StaticHeader = React.createClass({
	
onItemClick: function (event) {
	$("header.static nav").toggle();
},

onPageClick: function (event) {
	$("header.static nav").hide();
},
	
  render: function () {
    return (
      <header className="static">
      <div className="static-nav-button" onClick={this.onItemClick}></div>
        <nav>
        	<div className="left">
	        <ul className="menu nav">
		        <li className={this.props.location.pathname == '/home'? 'active':''}><Link to="/home" onClick={this.onItemClick}>Home</Link></li>
		        <li className={this.props.location.pathname == '/about'? 'active':''}><Link to="/about" onClick={this.onItemClick}>About</Link></li>
		        <li className={this.props.location.pathname == '/news'? 'active':''}><Link to="/news" onClick={this.onItemClick}>News</Link></li>
		        <li className={this.props.location.pathname == '/partner'? 'active':''}><Link to="/partner" onClick={this.onItemClick}>Partner</Link></li>
		        <li className={this.props.location.pathname == '/contact'? 'active':''}><Link to="/contact" onClick={this.onItemClick}>Contact</Link></li>
		      </ul>
		      </div>
		      
		      <div className="right">  
		      <ul className="menu user"> 
		        {this.props.user.email ?
		          <span>
		            <li className="flight-search"><Link to="/search" className="flight-search" onClick={this.onItemClick}>Flight Search</Link></li>
		            <li className="active"> <a href="/logout" onClick={this.onItemClick}>Log out</a></li>
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
