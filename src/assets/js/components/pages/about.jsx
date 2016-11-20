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
    ActionsStore.updateNavBarPage('about');

    fetch('/site/about/info', {
      method: 'POST',
      credentials: 'same-origin' // required for including auth headers
    })
      .then((response) => response.json())
      .then((json) => {
        this.setState({
          isLoading: false,
          aboutData: {
            cur_year: this.state.aboutData.cur_year,
            software_version: json.site_info.software_version,
            contact_email: json.site_info.contact_email
          }
        });
      })
      .catch((error) => {
        console.log(error);
      })
  },


  render: function () {
    return (
      <div className="about">
        {
          this.state.isLoading === true ?
            <Loader/>
            : <About AboutData={this.state.aboutData}/>
        }
      </div>
    )
  }
});

function renderAboutPage(AboutPageData) {
  if ($('#aboutpage').length) {
    ReactContentRenderer.render(<AboutPage/>, $('#aboutpage'));
  }
}

$(document).ready(function () {
  if (typeof AboutPageData != 'undefined') {
    renderAboutPage(AboutPageData);
  }
});
