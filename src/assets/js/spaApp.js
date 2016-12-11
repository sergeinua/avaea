import React from 'react';
import { render } from 'react-dom';
import * as ReactRedux from 'react-redux';
import { Router, browserHistory, IndexRoute, Route } from 'react-router';
import AppContainer from 'containers/AppContainer.jsx';
import StaticContainer from 'containers/StaticContainer.jsx';
import { clientStore } from 'reducers.js';

import NavBarContainer from 'components/_common/NavBar.jsx'
import DisplayAlert from 'components/_common/DisplayAlert.jsx';

import HomePage from 'components/static/pages/home.jsx';
import AboutPage from 'components/static/pages/about.jsx';
import JobsPage from 'components/static/pages/jobs.jsx';
import NewsPage from 'components/static/pages/news.jsx';
import BlogPage from 'components/static/pages/blog.jsx';
import TermsPage from 'components/static/pages/terms.jsx';
import PrivacyPage from 'components/static/pages/privacy.jsx';

import ProfilePage from 'components/pages/profile.jsx';
import SearchFormPageContainer from 'components/pages/searchform.jsx';
import ResultPageContainer from 'components/pages/result.jsx';
import OrderPage from 'components/pages/order.jsx';
import BookingPage from 'components/pages/booking.jsx';

import { unfocusFormForIos } from './functions.js';

//load all of Bootstrap's jQuery plugins onto the jQuery object.
require('bootstrap');
require('legacyJquery.js');

$(document).ready(function() {

  if (document.getElementById('spa-app')) {


    if ( InitData.page ) {
      browserHistory.push(InitData.page);
    }

    //DEMO-796 fix for iOS10
    browserHistory.listen( location =>  {
      unfocusFormForIos();
    });

    render((
      <ReactRedux.Provider store={clientStore}>
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
          <Route path="/" component={AppContainer}>
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
  }
});

//for login page

$(document).ready(function() {
  var NavBarData = $('#onlynavbar').attr('page');
  if (typeof NavBarData != 'undefined' && $('#onlynavbar').length) {
    var userData = (typeof NavBarInit != 'undefined' && NavBarInit.user) ? NavBarInit.user : {};
    render(
      <ReactRedux.Provider store={clientStore}><NavBarContainer page={NavBarData} user={userData} InitResultData={{}}/></ReactRedux.Provider>,
      document.getElementById('onlynavbar')
    );
  }
});
