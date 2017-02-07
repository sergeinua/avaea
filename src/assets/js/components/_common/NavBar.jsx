import React from 'react';
import { Link } from 'react-router';
import * as ReactRedux from 'react-redux';
import { ActionsStore, getUser, setCookie } from '../../functions.js';
import { finalizeValues } from '../searchform/Calendar.jsx';
import { browserHistory, hashHistory } from 'react-router';
import { supportsHistory } from 'history/lib/DOMUtils';
const historyStrategy = supportsHistory() ? browserHistory : hashHistory;
import moment from 'moment';

let NavBar = React.createClass({

  getDefaultProps: function() {
    return {
      user: false
    }
  },

  flightTypeName: {
    round_trip: 'Round trip',
    one_way: 'One way',
  },

  componentDidUpdate: function () {
    $('#nav_slide_menu').offcanvas({
      toggle: false,
      placement: 'left',
      autohide: true
    });
    $('#nav_slide_menu a')
      .click(function () {
        $('#nav_slide_menu').offcanvas('hide');
      });
  },

  componentDidMount: function () {
    $('#nav_slide_menu').offcanvas({
      toggle: false,
      placement: 'left',
      autohide: true
    });
    $('#nav_slide_menu a')
      .click(function () {
        $('#nav_slide_menu').offcanvas('hide');
      });
  },

  componentWillMount: function () {
    ActionsStore.changeCalendarDate = () => {
      finalizeValues(this.props.commonData.searchParams);
    };
  },

  handleVoice: function () {
    ActionsStore.changeForm('voice_search');
  },

  handleBackToSearch: function () {
    ActionsStore.changeForm(this.props.commonData.searchParams.flightType || 'round_trip');
  },

  handleCalendar: function () {
    ActionsStore.changeCalendarDate();
  },

  handleClearVoice: function () {
    ActionsStore.ClearVoiceInput();
  },

  handleBackToSearchResult: function () {
    historyStrategy.push('/result');
  },

  handleBackToSearchForm: function () {
    historyStrategy.push('/search');
  },

  handleHomeLink: function () {
    if (!this.props.location) {
    	window.location.assign('/search');
    } else {
      historyStrategy.push('/search');
    }
  },

  showLink: function (to, text) {
    let id = 'menu-link-' + text.replace(/\W+/g, '_').toLowerCase();
    if (!this.props.location) {
      return <a id={id} href={to}>{text}</a>
    } else {
      return <Link id={id} to={to}>{text}</Link>
    }
  },

  showLinkProfile: function (to, text) {
    if (!getUser()) {
      return <a id='menu-link-profile' href='/login' onClick={this.saveProfileRedirect}>{text}</a>
    } else {
      if (!this.props.location) {
        return <a id='menu-link-profile' href={to}>{text}</a>
      } else {
        return <Link id='menu-link-profile' to={to}>{text}</Link>
      }
    }
  },

  saveProfileRedirect: function () {
    setCookie('redirectTo', '/profile', {expires: 300});
  },

  render: function() {
    return (
      <nav className="navbar navbar-default navbar-fixed-top">
        {  this.props.commonData.currentForm != 'airport-search'
        && this.props.commonData.currentForm != 'order'
        && this.props.commonData.currentForm != 'calendar' ?
          <div id="main_title">
            <div className="navbar-header">
              {this.props.commonData.currentForm == 'voice_search' ? <div className="back-history" onClick={this.handleBackToSearch}>Back</div> : null}
              {this.props.commonData.currentForm == 'calendar' || this.props.commonData.currentForm == 'voice_search' ? null:
                <span>
                  <button type="button" className="navbar-toggle pull-left" data-toggle="offcanvas"
                          data-target="#nav_slide_menu" data-canvas="body">
                    <span className="icon-bar"></span>
                    <span className="icon-bar"></span>
                    <span className="icon-bar"></span>
                  </button>
                  <div className="navbar-brand" onClick={this.handleHomeLink}></div>
                  {this.props.commonData.currentForm == 'result'?
                    <div className="flight-info">
	                      <div id="result-search-info-bar" className="result-search-info-bar" onClick={this.handleBackToSearchForm}>
	                      <div className="wrapper">
		                        <span className="requested-airports">{ this.props.commonData.searchParams.DepartureLocationCode + '-' +  this.props.commonData.searchParams.ArrivalLocationCode}</span>
		                        <span className="flight-date">
		                { moment(this.props.commonData.searchParams.departureDate).format('DD MMM') + (this.props.commonData.searchParams.returnDate?'-'+moment(this.props.commonData.searchParams.returnDate).format('DD MMM'):'') }
							              </span>
							              <span className="seating-class">{ serviceClass[this.props.commonData.searchParams.CabinClass] }</span>
							              <span className="flight-type">{ this.flightTypeName[this.props.commonData.searchParams.flightType] }</span>
							              <span className="passenger-count">{ this.props.commonData.searchParams.passengers }</span>
						              </div>
	                      </div>
                    </div>:null
                  }
                </span>
              }
              {((this.props.commonData.currentForm == 'round_trip' || this.props.commonData.currentForm == 'one_way') && this.props.page != 'login') ?
                  <div id="voice_search" className="flight-type-item voice-search-button" onClick={this.handleVoice}><i className="icon-mic"></i></div>:null}
              {this.props.commonData.currentForm == 'voice_search' ?
              <div className="clear-textarea" id="clear_button" onClick={this.handleClearVoice}>Start over</div> : null
              }
            </div>

            <div id="nav_slide_menu"
              className={this.props.commonData.currentForm == 'voice_search' ? "voice-search navmenu navmenu-default navmenu-fixed-left offcanvas" : "navmenu navmenu-default navmenu-fixed-left offcanvas"}
              role="navigation">
              <ul className="nav navbar-nav">
                <li>{this.showLink("/about","About")}</li>
                <li>{this.showLink("/search","Search")}</li>
                <li>{this.showLinkProfile("/profile", "Profile")}</li>
                <li>
                  {getUser().email ?
                    <a href="/logout" id='menu-link-logout'>Log out <b>{ getUser().email }</b></a>
                    :
                    <a href="/login" id='menu-link-login'>Log In</a>
                  }
                </li>
              </ul>
            </div>
          </div>:null
        }

        {this.props.commonData.currentForm == 'airport-search' ?
          <div id="search_title" className="airport-search-panel">
            <div className="navbar-header">
              <div className="airport-search-header">
                <input id="airport-input" type="text" name="airport" placeholder="City, airport code or airport name"/>
                <button type="button" id="search_button_top" className="search_button_top_cancel" onClick={this.handleBackToSearch}>Cancel</button>
              </div>
            </div>
          </div>:null
        }

        {this.props.commonData.currentForm == 'calendar'?
          <div id="date_select" className="calendar-header">
            <div className="navbar-header">
              <div className="container-fluid">
                <div className="row">
                    <div className="info">
                      <span className="dep"></span>
                      {
                        this.props.commonData.searchParams.flightType === 'round_trip' ?
                        <span className="ret"></span>  : ''
                      }
                      </div>
                    <button type="button" id="date_select_top" className="date_select-button small-button" onClick={this.handleCalendar}>Done</button>
                </div>
              </div>
            </div>
          </div>:null
        }

        {this.props.commonData.currentForm == 'order'?
          <div className="booking-panel">
            <div className="navbar-header back-style">
              <div className="container-fluid">
                <div className="row">
                  <div id="order-page-back-button" className="back-history" onClick={this.handleBackToSearchResult}>Back</div>
                </div>
              </div>
            </div>
          </div>:null
        }

      </nav>

    )
  }
});

const mapStateCommon = function(store) {
  return {
    commonData: store.commonData,
  };
};

const NavBarContainer = ReactRedux.connect(mapStateCommon)(NavBar);

export default NavBarContainer;
