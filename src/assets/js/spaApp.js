import React from 'react';
import { render } from 'react-dom';
import * as ReactRedux from 'react-redux';
import { Router, browserHistory, IndexRoute, Route } from 'react-router';
import AppContainer from 'containers/AppContainer.jsx';
import StaticContainer from 'containers/StaticContainer.jsx';
import { clientStore, observeStore, storeGetCommonVal, storeInitialState } from 'reducers.js';

import NavBarContainer from '~/_common/NavBar'
import DisplayAlert from '~/_common/DisplayAlert';

import HomePage from 'components/static/pages/home.jsx';
import AboutPage from 'components/static/pages/about.jsx';
import PartnerPage from 'components/static/pages/partner.jsx';
import JobsPage from 'components/static/pages/jobs.jsx';
import NewsPage from 'components/static/pages/news.jsx';
import ContactPage from 'components/static/pages/contact.jsx';
import BlogPage from 'components/static/pages/blog.jsx';
import TermsPage from 'components/static/pages/terms.jsx';
import PrivacyPage from 'components/static/pages/privacy.jsx';
import UnsupportedPage from 'components/static/pages/unsupported.jsx';

import ProfilePage from 'components/pages/profile.jsx';
import SearchFormPageContainer from 'components/pages/searchform.jsx';
import ResultPageContainer from 'components/pages/result.jsx';
import OrderPage from 'components/pages/order.jsx';
import BookingPage from 'components/pages/booking.jsx';

import { unfocusFormForIos, ActionsStore, handleChangeTripSearchForm, confTripSearchForms, getDefaultDateSearch } from './functions.js';
import { actionSetCommonVal } from './actions.js';

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
      _localSearchParams = getDefaultDateSearch(JSON.parse(localStorage.getItem('searchParams')))
    } else if (InitData.defaultSearch) {
      //use data from server with default/session params if local storage is empty
      _localSearchParams = getDefaultDateSearch(InitData.defaultSearch)
    }

    Promise.resolve( clientStore.dispatch(actionSetCommonVal('searchParams', _localSearchParams)) )
      .then(function () {
        render((
          <ReactRedux.Provider store={clientStore}>
            <Router onUpdate={() => window.scrollTo(0, 0)} history={browserHistory}>
              <Route path="/" component={StaticContainer}>
                <Route path="/home" component={HomePage}/>
                <Route path="/about" component={AboutPage}/>
                <Route path="/jobs" component={JobsPage}/>
                <Route path="/news" component={NewsPage}/>
                <Route path="/blog" component={BlogPage}/>
                <Route path="/partner" component={PartnerPage}/>
                <Route path="/contact" component={ContactPage}/>
                <Route path="/terms" component={TermsPage}/>
                <Route path="/privacy" component={PrivacyPage}/>
                <Route path="/unsupported" component={UnsupportedPage}/>
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
        return true;
      })
      .then(function () {
        return observeStore(storeGetCommonVal, 'searchParams', handleChangeTripSearchForm); //
      })
      .then(function () {
        let iconSpriteMap = sessionStorage.getItem('iconSpriteMap');
        if (iconSpriteMap && iconSpriteMap != 'undefined') {
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
          ActionsStore.changeForm(_localSearchParams.flightType);
        }
      });
  }
});

//for login page

$(document).ready(function() {
  var NavBarData = $('#onlynavbar').attr('page');
  if (typeof NavBarData != 'undefined' && $('#onlynavbar').length) {
    render(
      <ReactRedux.Provider store={clientStore}><NavBarContainer page={NavBarData} InitResultData={{}}/></ReactRedux.Provider>,
      document.getElementById('onlynavbar')
    );
  }
});
