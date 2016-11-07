var AboutPage = React.createClass({

  getUser: function () {
    return this.props.AboutPageData.user;
  },

  getAboutData: function () {
    return {
      cur_year: this.props.AboutPageData.cur_year,
      software_version: this.props.AboutPageData.software_version,
      contact_email: this.props.AboutPageData.contact_email
    }
  },

  render: function () {
    return (
      <div>
        <NavBar page="about" user={this.getUser()} InitResultData={{}}/>
        <About AboutData={this.getAboutData()}/>
      </div>
    )
  }
});

function renderAboutPage(AboutPageData) {
  if ($('#aboutpage').length) {
    ReactContentRenderer.render(<AboutPage AboutPageData={AboutPageData}/>, $('#aboutpage'));
  }
}

$(document).ready(function () {
  if (typeof AboutPageData != 'undefined') {
    renderAboutPage(AboutPageData);
  }
});
