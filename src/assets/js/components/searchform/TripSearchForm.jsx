import React from 'react';
import moment from 'moment';
import { ActionsStore } from '../../functions.js';
import { observeStore, storeGetCommonVal, observeUnsubscribers } from '../../reducers.js';
import { browserHistory, hashHistory } from 'react-router';
import { supportsHistory } from 'history/lib/DOMUtils';
const historyStrategy = supportsHistory() ? browserHistory : hashHistory;

// Vars
var flashErrorTimeout = 1000;

var TripSearchForm = React.createClass({

  getInitialState: function () {
    observeStore(storeGetCommonVal, 'formSubmitCount', this.handleSubmitForm);

    return {
      '.open-calendar.dep': {
        isError: false,
        isErrorFlash: false
      },
      '.open-calendar.ret': {
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

  showCalendar: function () {
    return function () {
      ActionsStore.changeForm('calendar');
    }.bind(this);
  },

  submitSearchForm: function (topSearchOnly) {
    return function () {
      Promise.resolve( ActionsStore.setFormValue('topSearchOnly', topSearchOnly) )
        .then(function () {
          ActionsStore.submitTripSearchForm();
        });
      // FIXME - hides logo for devices only when navbar shows "flight-info" div
      // so logo does not push the search query down
      $("body").addClass('suppress-logo');
    }.bind(this);
  },

  handleSubmitForm: function (submitCounter) {
    let _executeSubmit = function () {
      if (submitCounter && this.validateForm()) {
        if (this.props.InitSearchFormData.currentForm != 'round_trip') {
          ActionsStore.setFormValue('returnDate', '');
        }
        let searchParams = JSON.stringify(this.props.InitSearchFormData.searchParams);
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
      var newStateUpdate = {};
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

    var self = this;
    var removeFlashErrorCallback = function () {
      var property = self.state[stateFieldName];
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
    var property = this.state[stateFieldName];
    if (property) {
      this.setState(
        createStateFieldsUpdate(this.state, stateFieldName, {isError: false, isErrorFlash: false})
      );
    }
  },

  validateForm: function () {
    let _executeValidate = function () {
      let _isError = false;
      let formErrors = this.props.InitSearchFormData.formErrors;
      let searchParams = this.props.InitSearchFormData.searchParams;

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
        this.setErrorElement('.open-calendar.ret');
        _isError = true;
      }

      if (formErrors.departureDate) {
        this.setErrorElement('.open-calendar.dep');
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
    var resultClass = '';
    var property = this.state[propertyName];
    var errorElemClass = 'error-elem';
    var errorFlashClass = 'error-flash';
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

  getSubmitButtonDisabledClass: function () {
    let formErrors = this.props.InitSearchFormData.formErrors;
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
      <div className="searchform">

        <div className="flight-direction">

          <div id="from-area"
               className={"area from " + (this.props.InitSearchFormData.searchParams.DepartureLocationCode ? "sel" : "") + " " + this.getErrorClass('#from-area')}
               onClick={this.handleAirportSearch('DepartureLocationCode')}>
            <div className="label-d">From</div>
            {!this.props.InitSearchFormData.searchParams.DepartureLocationCode ?
              <span className="plus">+</span>
              :
              <div className="location">
                <span
                  id="from-airport-selected">{this.props.InitSearchFormData.searchParams.DepartureLocationCode}</span>
                <div id="from-city-selected"
                     className="city-name">{this.props.InitSearchFormData.searchParams.DepartureLocationCodeCity}</div>
              </div>
            }
          </div>{/* ends from area */}

          <div id="to-area"
               className={"area to " + (this.props.InitSearchFormData.searchParams.ArrivalLocationCode ? "sel" : "") +
               " " + this.getErrorClass('#to-area')}
               onClick={this.handleAirportSearch('ArrivalLocationCode')}>
            <div className="label-d">To</div>
            {!this.props.InitSearchFormData.searchParams.ArrivalLocationCode ?
              <span className="plus">+</span>
              :
              <div className="location">
                <span
                  id="to-airport-selected">{this.props.InitSearchFormData.searchParams.ArrivalLocationCode}</span>
                <div id="to-city-selected"
                     className="city-name">{this.props.InitSearchFormData.searchParams.ArrivalLocationCodeCity}</div>
              </div>
            }
          </div>{/* ends to area */}

        </div>{/* ends flight-direction */}

        <div className="flight-date">

          <div id="flight-date-dep-open-calendar"
            className={['open-calendar dep ']  + [this.props.InitSearchFormData.currentForm == 'one_way' ? "one-way ":""] + [this.getErrorClass('.open-calendar.dep')]}  
            onClick={this.showCalendar('dep')}>
            <div className="wrapper">
                <div className="direction label-d">Depart</div>
                <div id="search-form-depart-date"
                  className="weekday label-d">{this.getDatePart('weekday', this.props.InitSearchFormData.searchParams.departureDate)}</div>
              </div>
            {!this.props.InitSearchFormData.searchParams.departureDate ?
              <div className="plus">+</div>
              :
              <div className="the-date">
                <span>{this.getDatePart('date', this.props.InitSearchFormData.searchParams.departureDate)}</span>
                <span> {this.getDatePart('month', this.props.InitSearchFormData.searchParams.departureDate)}</span>
              </div>
            }

          </div>

          { this.props.InitSearchFormData.currentForm == 'round_trip' ?
            <div id="flight-date-ret-open-calendar" className={
              "open-calendar ret" +
              " " + this.getErrorClass('.open-calendar.ret')
            }
                 onClick={this.showCalendar('ret')}>
              <div className="wrapper">
                  <div className="direction label-d">Return</div>
                  <div id="search-form-return-date"
                    className="weekday label-d">{this.getDatePart('weekday', this.props.InitSearchFormData.searchParams.returnDate)}</div>
              </div>
              {!this.props.InitSearchFormData.searchParams.returnDate ?
                <div className="plus">+</div>
                :
                <div className="the-date">
                  <span>{this.getDatePart('date', this.props.InitSearchFormData.searchParams.returnDate)}</span>
                  <span> {this.getDatePart('month', this.props.InitSearchFormData.searchParams.returnDate)}</span>
                </div>
              }

            </div> : null
          }
        </div>

        <div className="search-buttons">
	        
          <button id="search-form-all-flights-button" type="submit" className={
            "big-button search-button " + this.getSubmitButtonDisabledClass()} onClick={this.submitSearchForm(0)}>
          	Search
          </button>
           
				  {/* no 2nd button until we have better agent customization */}
				  {/*
          <button id="search-form-top-flights-button"
            type="submit"
            className={"big-button search-top-button " + this.getSubmitButtonDisabledClass()} onClick={this.submitSearchForm(1)}>
          	Top Flights
          </button>
          */} 
        </div>

      </div>
    )
  }
});

export default TripSearchForm;
