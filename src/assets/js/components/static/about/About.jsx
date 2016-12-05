var StaticAbout = React.createClass({
  getInitialState: function () {
    return {
      cur_year: this.props.AboutData.cur_year,
      software_version: this.props.AboutData.software_version,
      contact_email: this.props.AboutData.contact_email
    };
  },

  render: function () {
    return (
      <div className="sitepage about">

        <div className="copyright">&copy;{this.state.cur_year} AVAEA Inc., All Rights Reserved</div>

        <div className="release-version">
          Avaea Agent { this.state.software_version}
        </div>

        <div className="clickmail">
          <a className="big-button" href={ "mailto:" + this.state.contact_email }>
            <span className="fa fa-envelope-o"></span>
            Contact Us
          </a>
        </div>

      </div>
    )
  }
});
