$(document).ready(function() {

  if (document.getElementById('spa-app')) {
    const Container = (props) => <div>
      <NavBar />
      {props.children}
    </div>;

    const StaticContainer = (props) => <div>
      <link rel="stylesheet" href="/static/static.css"/>
      <StaticHeader {...props} user={InitData.user||{}}/>
      {props.children}
      <StaticFooter {...props} user={InitData.user||{}}/>
    </div>;

    var Router = window.ReactRouter.Router;
    var browserHistory = window.ReactRouter.browserHistory;
    var IndexRoute = window.ReactRouter.IndexRoute;
    var Route = window.ReactRouter.Route;
    if ( InitData.page ) {
      browserHistory.push(InitData.page);
    }

    //DEMO-796 fix for iOS10
    browserHistory.listen( location =>  {
      unfocusFormForIos();
    });

    ReactDOM.render((
      <Router history={browserHistory}>
        <Route path="/" component={StaticContainer}>
          <Route path="/home" component={HomePage}/>
          <Route path="/about" component={AboutPage}/>
          <Route path="/jobs" component={JobsPage}/>
          <Route path="/news" component={NewsPage}/>
          <Route path="/blog" component={BlogPage}/>
          <Route path="/terms" component={TermsPage}/>
          <Route path="/privacy" component={PrivacyPage}/>
        </Route>
        <Route path="/" component={Container}>
          <IndexRoute component={SearchFormPage} />
          <Route path="/profile" component={ProfilePage}/>
          <Route path="/search" component={SearchFormPage}/>
          <Route path="/result" component={ResultPage}/>
          <Route path="/order/:itineraryId/:specialOrder" component={OrderPage}/>
          <Route path="/booking/:bookingId" component={BookingPage}/>
          <Route path="*" component={DisplayAlert}/>
        </Route>
      </Router>
    ), document.getElementById('spa-app'));
  }
});
