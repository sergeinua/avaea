import React from 'react';
import * as ReactRedux from 'react-redux';
import moment from 'moment';
import ClassChooser from './ClassChooser.jsx';
import PassengerChooser from './PassengerChooser.jsx';
import Iframe from 'react-iframe';
import { actionSetCommonVal } from '../../actions.js';
import { ActionsStore, getUser, setCookie, getCookie } from '../../functions.js';
import { clientStore, observeStore, storeGetCommonVal, observeUnsubscribers } from '../../reducers.js';
import { browserHistory, hashHistory } from 'react-router';
import { supportsHistory } from 'history/lib/DOMUtils';
const historyStrategy = supportsHistory() ? browserHistory : hashHistory;

// Vars
const flashErrorTimeout = 2000;

const TripSearchForm = React.createClass({

  getInitialState: function () {
    observeStore(storeGetCommonVal, 'formSubmitCount', this.handleSubmitForm);

    return {
      '.flight-date-info-item.dep': {
        isError: false,
        isErrorFlash: false
      },
      '.flight-date-info-item.ret': {
        isError: false,
        isErrorFlash: false
      },
      '#from-area': {
        isError: false,
        isErrorFlash: false
      },
      '#to-area': {
        isError: false,
        isErrorFlash: false
      }
    }
  },

  showCalendar: function (calendarType) {
    return function () {
      clientStore.dispatch(actionSetCommonVal('calendarType', calendarType));
      ActionsStore.changeForm('calendar');
    }.bind(this);
  },

  submitSearchForm: function (topSearchOnly) {
    return function () {
      Promise.resolve( ActionsStore.setFormValue('topSearchOnly', topSearchOnly) )
        .then(function () {
          ActionsStore.submitTripSearchForm();
        });
    }.bind(this);
  },

  handleMeriHint: function () {
  	// FIXME - could be React
  	
  	if ( $('.meri-wrapper').hasClass('showing')) {
  		$('.meri-speaks ').fadeToggle('fast');
  	} else {
	  	$('.meri-speaks ').delay(1000).fadeToggle('fast');
	  }
  	
  	$('.meri-wrapper ').toggleClass('showing');
  },

  handleSubmitForm: function (submitCounter) {
    let _executeSubmit = function () {

      if (submitCounter && this.validateForm()) {

        if (this.props.commonData.currentForm != 'round_trip') {
          ActionsStore.setFormValue('returnDate', '');
        }

        let searchParams = JSON.stringify(this.props.commonData.searchParams);
        // save search params to local storage on request
        localStorage.setItem('searchParams', searchParams);
        historyStrategy.push(
          {
            pathname: '/result',
            query: {
              s: btoa(searchParams)
            }
          }
        );
      }
    }.bind(this); // Important to bind components properties

    return _executeSubmit();
  },

// For elements with error

  setErrorElement: function (stateFieldName) {
    function createStateFieldsUpdate(state, propertyName, toUpdate) {
      let newStateUpdate = {};
      newStateUpdate[propertyName] = {};
      Object.keys(state[propertyName]).forEach(function (oldProperty) {
        newStateUpdate[propertyName][oldProperty] = state[propertyName][oldProperty];
      });

      Object.keys(toUpdate).forEach(function (toUpdatePropertyName) {
        newStateUpdate[propertyName][toUpdatePropertyName] = toUpdate[toUpdatePropertyName];
      });
      return newStateUpdate;
    }

    if (this.isMounted()) {
      this.setState(
        createStateFieldsUpdate(this.state, stateFieldName, {isError: true, isErrorFlash: true})
      );
    }

    let self = this;
    let removeFlashErrorCallback = function () {
      let property = self.state[stateFieldName];
      if (self.isMounted() && property) {
        self.setState(createStateFieldsUpdate(self.state, stateFieldName, {isErrorFlash: false}));
      }
    };
    setTimeout(function () {
      removeFlashErrorCallback();
    }, flashErrorTimeout);

  },

  // not used currently, maybe it should be removed.
  unsetErrorElement: function (stateFieldName) {
    let property = this.state[stateFieldName];
    if (property) {
      this.setState(
        createStateFieldsUpdate(this.state, stateFieldName, {isError: false, isErrorFlash: false})
      );
    }
  },

  validateForm: function () {
    let _executeValidate = function () {
      let _isError = false;
      let formErrors = this.props.commonData.formErrors;
      let searchParams = this.props.commonData.searchParams;

      if (formErrors.isError) {
        _isError = true;
      }

      // Check airports selection
      if (formErrors.fromArea) {
        this.setErrorElement('#from-area');
        _isError = true;
      }
      if (formErrors.toArea) {
        this.setErrorElement('#to-area');
        _isError = true;
      }

      if (!searchParams.passengers) {
        ActionsStore.setFormValue('passengers', 1);
      }

      if (!searchParams.CabinClass) {
        ActionsStore.setFormValue('CabinClass', 'E');
      }

      if (formErrors.returnDate) {
        this.setErrorElement('.flight-date-info-item.ret');
        _isError = true;
      }

      if (formErrors.departureDate) {
        this.setErrorElement('.flight-date-info-item.dep');
        _isError = true;
      }

      return !_isError;
    }.bind(this);

    return _executeValidate();
  },

  getDatePart: function (type, date) {
    let _moment = moment.isMoment(date) ? date : moment(date || undefined);
    let result = '';
    switch (type) {
      case 'weekday':
        result = _moment.format('dddd');
        break;
      case 'date':
        result = _moment.format('DD');
        break;
      case 'month':
        result = _moment.format('MMM');
        break;
      case 'year':
        result = _moment.format('YYYY');
        break;
    }
    return date ? result : '';
  },

  getErrorClass: function (propertyName) {
    let resultClass = '';
    let property = this.state[propertyName];
    let errorElemClass = 'error-elem';
    let errorFlashClass = 'error-flash';
    if (!property) {
      console.log('Uninitialized search form state property found: "' + propertyName + '"')
    }
    if (property && property.isError) {
      resultClass += errorElemClass + ' '
    }
    if (property && property.isErrorFlash) {
      resultClass += errorFlashClass;
    }
    return resultClass;
  },

  getButtonsDisabledClass: function () {
    let formErrors = this.props.commonData.formErrors;
    return formErrors.isError ? 'disabled ': '';
  },

  handleAirportSearch: function (target) {
    return function () {
      ActionsStore.changeForm('airport-search');
      ActionsStore.setTarget(target);
    }.bind(this);
  },

  componentWillUnmount: () => {
    if (observeUnsubscribers['formSubmitCount']) {
      observeUnsubscribers['formSubmitCount']();
    }
  },

  render() {
    return (
      <div className="form-fields">

        <div className="row text-center flight-direction">
          <div className="col-xs-12 clearfix flight-direction-form">
            <div className="row clearfix">

              <div className="col-xs-6">
                <div id="from-area"
                     className={(this.props.commonData.searchParams.DepartureLocationCode ? "flight-direction-item from sel" : "flight-direction-item from") + " " + this.getErrorClass('#from-area')}
                     onClick={this.handleAirportSearch('DepartureLocationCode')}>
                  <div className="flight-direction-item-from-to">From</div>
                  {!this.props.commonData.searchParams.DepartureLocationCode ?
                    <span className="plus">+</span>
                    :
                    <div className="search-from">
                      <span
                        id="from-airport-selected">{this.props.commonData.searchParams.DepartureLocationCode}</span>
                      <div id="from-city-selected"
                           className="flight-direction-item-from-to-city">{this.props.commonData.searchParams.DepartureLocationCodeCity}</div>
                    </div>
                  }
                </div>
              </div>

              <div className="col-xs-6">
                <div id="to-area"
                     className={(this.props.commonData.searchParams.ArrivalLocationCode ? "flight-direction-item to sel" : "flight-direction-item to") +
                     " " + this.getErrorClass('#to-area')}
                     onClick={this.handleAirportSearch('ArrivalLocationCode')}>
                  <div className="flight-direction-item-from-to">To</div>
                  {!this.props.commonData.searchParams.ArrivalLocationCode ?
                    <span className="plus">+</span>
                    :
                    <div className="search-to">
                      <span
                        id="to-airport-selected">{this.props.commonData.searchParams.ArrivalLocationCode}</span>
                      <div id="to-city-selected"
                           className="flight-direction-item-from-to-city">{this.props.commonData.searchParams.ArrivalLocationCodeCity}</div>
                    </div>
                  }
                </div>
              </div>

            </div>
          </div>
        </div>

        <div className="flight-date-info row">

          {this.props.commonData.formErrors.returnDate && this.props.commonData.searchParams.returnDate
          ? <div className="error-date">Return date must be after Departure date</div>
          : null}

          <div id="flight-date-dep-open-calendar"
            className={'flight-date-info-item dep col-xs-6 open-calendar' + this.getErrorClass('.flight-date-info-item.dep')}
            onClick={this.showCalendar('dep')}>
            <div className="row">
              <div className="col-xs-12">
                <div className="direction label-d">Depart</div>
                <div id="search-form-depart-date"
                  className="weekday">{this.getDatePart('weekday', this.props.commonData.searchParams.departureDate)}</div>
              </div>
            </div>
            {!this.props.commonData.searchParams.departureDate ?
              <div className="tap-plus">+</div>
              :
              <div className="row the-date">
                <span
                  className="tap-date">{this.getDatePart('date', this.props.commonData.searchParams.departureDate)}</span>
                <span
                  className="tap-month">{this.getDatePart('month', this.props.commonData.searchParams.departureDate)}</span>
                <span
                  className="tap-year">{this.getDatePart('year', this.props.commonData.searchParams.departureDate)}</span>
              </div>
            }

          </div>

          { this.props.commonData.currentForm == 'round_trip' ?
            <div id="flight-date-ret-open-calendar"
              className={"flight-date-info-item ret col-xs-6 open-calendar" + " " + this.getErrorClass('.flight-date-info-item.ret')}
              onClick={this.showCalendar('ret')}>
              <div className="row">
                <div className="col-xs-12">
                  <div className="direction label-d">Return</div>
                  <div id="search-form-return-date"
                    className="weekday">{this.getDatePart('weekday', this.props.commonData.searchParams.returnDate)}</div>
                </div>
              </div>
              {!this.props.commonData.searchParams.returnDate ?
                <div className="tap-plus">+</div>
                :
                <div className="row the-date">
                  <span
                    className="tap-date">{this.getDatePart('date', this.props.commonData.searchParams.returnDate)}</span>
                  <span
                    className="tap-month">{this.getDatePart('month', this.props.commonData.searchParams.returnDate)}</span>
                  <span
                    className="tap-year">{this.getDatePart('year', this.props.commonData.searchParams.returnDate)}</span>
                </div>
              }

            </div> : null
          }
        </div>

        <div className="flight-additional-info row">
          <div className="col-xs-12">
            <PassengerChooser searchParams={this.props.commonData.searchParams}/>
            <ClassChooser searchParams={this.props.commonData.searchParams}/>
          </div>
        </div>

        <div className="search buttons duo">
		      <div className='meri-wrapper'> 
		      
	        	<div id="meri-speaks-searchform" className="meri-speaks">
			      	<div className="bubble">
			        	We remove worst flights and factor FF miles.
				        	{getUser().email ?
				        			<span className="logged-in"> We also give your <a href="/profile" id='link-profile'>preferred airlines</a> priority.</span>
				              :
				              <span className="logged-out"> <a href="/login" id='link-profile'>Log in</a> to set and factor preferred airlines.</span>
			            }
			        	<div id="meri-speaks-close-x" className="close-x" onClick={this.handleMeriHint}></div>
			      	</div>
			      </div>
			      
			    </div>  
			    
			    <div className="holder">
	          <button id="search-form-all-flights-button" 
	          	type="submit" 
	          	className={ "big-button search-button secondary " + this.getButtonsDisabledClass()} onClick={this.submitSearchForm(0)}>
	          	Show All
	          </button>
          
	          <button id="search-form-top-flights-button"
	            type="submit"
	            className={"big-button search-top-button " + this.getButtonsDisabledClass()} onClick={this.submitSearchForm(1)}>
	          	Show Best
	          </button>
	          <div id="info-cue" className={"info cue " + this.getButtonsDisabledClass()} onClick={this.handleMeriHint}></div>	
          </div>
        </div>
        
        {!(uaMobile) && !(uaChrome) ?
 	         <div id="wayfare-search-comparison" className="wayfare search comparison-unit">
 	     			<div className="ti compare">Compare our results</div>
      			<div className="holder">
              <Iframe 
              	id="c7aed39b" 
              	name="mc79eba9" 
              	className="wayfare" 
              	url="/static/adds_search_buttons.html"
                frameborder="0" 
                scrolling="no" 
                width="100%"
                position="relative">
              </Iframe>
 	          </div>
 	         </div>
 	         : null
 	       }
        
      </div>
    )
  }
});

const mapStateCommon = function(store) {
  return {
    commonData: store.commonData,
  };
};

const TripSearchFormContainer = ReactRedux.connect(mapStateCommon)(TripSearchForm);

export default TripSearchFormContainer;
