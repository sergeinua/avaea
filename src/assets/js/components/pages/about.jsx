var AboutPage = React.createClass({

  getInitialState: function () {
    return {
      isLoading: true,
      aboutData: {
        cur_year: new Date().getFullYear(),
        software_version: '',
        contact_email: ''
      },
    };
  },

  componentWillMount: function () {

    fetch('/site/about/info', {
      credentials: 'same-origin' // required for including auth headers
    })
      .then((response) => response.json())
      .then((json) => {
        this.setState({
          isLoading: false,
          aboutData: {
            software_version: json.software_version,
            contact_email: json.contact_email
          }
        });
      })
      .catch((error) => {
        console.log(error);
      })
  },

  getUser: function () {
    return this.props.AboutPageData.user;
  },

  render: function () {
    return (
      <div>
        <NavBar page="about" user={this.getUser()} InitResultData={{}}/>
        {
          this.state.isLoading === true ?
          <Loader size="medium"/>
          : <About AboutData={this.state.aboutData}/>
        }

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
