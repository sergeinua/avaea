$(document).ready(function() {

  if (document.getElementById('spa-app')) {
    const Container = (props) => <div>
      <NavBar />
      {props.children}
    </div>;

    var Router = window.ReactRouter.Router;
    var browserHistory = window.ReactRouter.browserHistory;
    var IndexRoute = window.ReactRouter.IndexRoute;
    var Route = window.ReactRouter.Route;
    if ( InitData.page ) {
      browserHistory.push(InitData.page);
    }

    ReactDOM.render((
      <Router history={browserHistory}>
        <Route path="/" component={Container}>
          <IndexRoute component={SearchFormPage} />
          <Route path="/about" component={AboutPage}/>
          <Route path="/profile" component={ProfilePage}/>
          <Route path="/search" component={SearchFormPage}/>
          {/*<Route path="/" component={SearchFormPage}/>*/}
          <Route path="/result" component={ResultPage}/>
          <Route path="*" component={DisplayAlert}/>
        </Route>
      </Router>
    ), document.getElementById('spa-app'));
  }
});
