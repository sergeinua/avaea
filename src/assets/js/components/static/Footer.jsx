var StaticFooter = React.createClass({
	
	render: function () {
    let d = new Date();
    return (
      <footer className="static">
        <span className="copyright">{('©' + d.getFullYear() + ' Avaea.com')}</span>
        <Link to="/terms">Terms & Conditions</Link>
        <Link to="/privacy">Privacy</Link>
      </footer>
    )
  }

});




