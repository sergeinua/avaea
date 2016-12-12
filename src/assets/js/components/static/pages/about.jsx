var AboutPage = React.createClass({

  getInitialState: function () {
    return {
      isLoading: false
    };
  },

  getUser: function () {
    //FIXME get rid from global var
    return this.props.user || InitData.user || false;
  },

  render: function () {
    return (
      <div>
        {
          this.state.isLoading === true ?
            <Loader/>
            :
            <StaticAbout user={this.getUser()||{}}/>
        }
      </div>
    )
  }
});
