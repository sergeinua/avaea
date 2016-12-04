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

  getUser: function () {
    //FIXME get rid from global var
    return this.props.user || InitData.user || false;
  },

  componentWillMount: function () {
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
            : <StaticAbout AboutData={this.state.aboutData} user={this.getUser()||{}}/>
        }
      </div>
    )
  }
});
