var StaticHome = React.createClass({
  render: function () {
    return (
      <div>
        src/assets/js/components/static/home/Home.jsx
        <ul>
          {this.props.user.email ?
            <span>
              <li><Link to="/search">Main Search Form</Link></li>
              <li> <a href="/logout" > Log out <b>{ this.props.user.email }</b></a></li>
            </span>
            :
            <li><a href="/login">Login</a></li>
          }
          <li><Link to="/about">About</Link></li>
          <li><Link to="/home">Home</Link></li>
          <li><Link to="/jobs">Jobs</Link></li>
          <li><Link to="/news">News</Link></li>
          <li><Link to="/blog">Blog</Link></li>
          <li><Link to="/terms">Terms</Link></li>
          <li><Link to="/privacy">Privacy</Link></li>
        </ul>
      </div>
    )
  }
});
