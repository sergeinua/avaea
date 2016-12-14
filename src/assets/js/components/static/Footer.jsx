var StaticFooter = React.createClass({
	
  render: function () {
    return (
      <footer className="static">
	      	<span className="copyright"></span>
	      	<Link to="/terms">Terms & Conditions</Link>
	      	<Link to="/privacy">Privacy</Link>
      </footer>
    )
  }
  
});
