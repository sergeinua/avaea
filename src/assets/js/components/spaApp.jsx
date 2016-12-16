$(document).ready(function() {

  if (document.getElementById('spa-app')) {
    const Container = (props) => <div>
      <NavBarContainer {...props} />
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

    let _localSearchParams;

    let hashedParams = (InitData.page ? decodeURIComponent(InitData.page).replace(/\/result\?s=/, ''):'');
    try {
      hashedParams = JSON.parse(atob(hashedParams));
    } catch (e) {
      hashedParams = false;
    }

    if (hashedParams) {
      //use data from url if exists
      _localSearchParams = hashedParams;
    } else if (localStorage.getItem('searchParams')) {
      //use data from local storage if exists
      _localSearchParams = JSON.parse(localStorage.getItem('searchParams'));
    } else if (InitData.defaultSearch) {
      //use data from server with default/session params if local storage is empty
      _localSearchParams = InitData.defaultSearch;
    }

    Promise.resolve( clientStore.dispatch(actionSetCommonVal('searchParams', _localSearchParams)) )
      .then(function () {
        ReactDOM.render((
          <ReactRedux.Provider store={clientStore}>
            <Router history={browserHistory}>
              <Route path="/" component={StaticContainer}>
                <Route path="/home" component={HomePage}/>
                <Route path="/about" component={AboutPage}/>
                <Route path="/jobs" component={JobsPage}/>
                <Route path="/news" component={NewsPage}/>
                <Route path="/blog" component={BlogPage}/>
                <Route path="/contact" component={ContactPage}/>
                <Route path="/terms" component={TermsPage}/>
                <Route path="/privacy" component={PrivacyPage}/>
              </Route>
              <Route path="/" component={Container}>
                <IndexRoute component={SearchFormPageContainer} />
                <Route path="/profile" component={ProfilePage}/>
                <Route path="/search" component={SearchFormPageContainer}/>
                <Route path="/result" component={ResultPageContainer}/>
                <Route path="/order/:itineraryId/:specialOrder" component={OrderPage}/>
                <Route path="/booking/:bookingId" component={BookingPage}/>
                <Route path="*" component={DisplayAlert}/>
              </Route>
            </Router>
          </ReactRedux.Provider>
        ), document.getElementById('spa-app'));
        return true;
      })
      .then(function () {
        return observeStore(storeGetCommonVal, 'searchParams', handleChangeTripSearchForm); //
      })
      .then(function () {
        let iconSpriteMap = sessionStorage.getItem('iconSpriteMap');
        if (iconSpriteMap) {
          clientStore.dispatch(actionSetCommonVal('iconSpriteMap', JSON.parse(iconSpriteMap || '[]')));
        }
        else {
          return true;
        }
      })
      .then(function () {
        if (_localSearchParams && _localSearchParams.flightType != storeInitialState.commonData.searchParams.flightType
          && (confTripSearchForms.indexOf(_localSearchParams.flightType) != -1)
          && (confTripSearchForms.indexOf(clientStore.getState().commonData.currentForm) != -1)
        ) {
          console.log('bootstrap form', _localSearchParams.flightType);
          ActionsStore.changeForm(_localSearchParams.flightType);
        }
      });
  }
});
