import React from 'react';
import moment from 'moment';
import ClassChooser from './ClassChooser.jsx';
import PassengerChooser from './PassengerChooser.jsx';
import { ActionsStore } from '../../functions.js';
import { observeStore, storeGetCommonVal, observeUnsubscribers } from '../../reducers.js';
import { browserHistory } from 'react-router';

// Vars
var flashErrorTimeout = 1000;

var TripSearchForm = React.createClass({

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
        browserHistory.push(
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
      <div className="form-fields">

        <div className="row text-center flight-direction">
          <div className="col-xs-12 clearfix flight-direction-form">
            <div className="row clearfix">

              <div className="col-xs-6">
                <div id="from-area"
                     className={(this.props.InitSearchFormData.searchParams.DepartureLocationCode ? "flight-direction-item from sel" : "flight-direction-item from") + " " + this.getErrorClass('#from-area')}
                     onClick={this.handleAirportSearch('DepartureLocationCode')}>
                  <div className="flight-direction-item-from-to">From</div>
                  {!this.props.InitSearchFormData.searchParams.DepartureLocationCode ?
                    <span className="plus">+</span>
                    :
                    <div className="search-from">
                      <span
                        id="from-airport-selected">{this.props.InitSearchFormData.searchParams.DepartureLocationCode}</span>
                      <div id="from-city-selected"
                           className="flight-direction-item-from-to-city">{this.props.InitSearchFormData.searchParams.DepartureLocationCodeCity}</div>
                    </div>
                  }
                </div>
              </div>

              <div className="col-xs-6">
                <div id="to-area "
                     className={(this.props.InitSearchFormData.searchParams.ArrivalLocationCode ? "flight-direction-item to sel" : "flight-direction-item to") +
                     " " + this.getErrorClass('#to-area')}
                     onClick={this.handleAirportSearch('ArrivalLocationCode')}>
                  <div className="flight-direction-item-from-to">To</div>
                  {!this.props.InitSearchFormData.searchParams.ArrivalLocationCode ?
                    <span className="plus">+</span>
                    :
                    <div className="search-to">
                      <span
                        id="to-airport-selected">{this.props.InitSearchFormData.searchParams.ArrivalLocationCode}</span>
                      <div id="to-city-selected"
                           className="flight-direction-item-from-to-city">{this.props.InitSearchFormData.searchParams.ArrivalLocationCodeCity}</div>
                    </div>
                  }
                </div>
              </div>

            </div>
          </div>
        </div>

        <div className="flight-date-info row">

          <div
            className={'flight-date-info-item dep col-xs-6 open-calendar' + this.getErrorClass('.flight-date-info-item.dep')}
            onClick={this.showCalendar('dep')}>
            <div className="row">
              <div className="col-xs-12">
                <div className="direction label-d">Depart</div>
                <div id="search-form-depart-date"
                  className="weekday">{this.getDatePart('weekday', this.props.InitSearchFormData.searchParams.departureDate)}</div>
              </div>
            </div>
            {!this.props.InitSearchFormData.searchParams.departureDate ?
              <div className="tap-plus">+</div>
              :
              <div className="row the-date">
                <span
                  className="tap-date">{this.getDatePart('date', this.props.InitSearchFormData.searchParams.departureDate)}</span>
                <span
                  className="tap-month">{this.getDatePart('month', this.props.InitSearchFormData.searchParams.departureDate)}</span>
                <span
                  className="tap-year">{this.getDatePart('year', this.props.InitSearchFormData.searchParams.departureDate)}</span>
              </div>
            }

          </div>

          { this.props.InitSearchFormData.currentForm == 'round_trip' ?
            <div className={
              "flight-date-info-item ret col-xs-6 open-calendar" +
              " " + this.getErrorClass('.flight-date-info-item.ret')
            }
                 onClick={this.showCalendar('ret')}>
              <div className="row">
                <div className="col-xs-12">
                  <div className="direction label-d">Return</div>
                  <div id="search-form-return-date"
                    className="weekday">{this.getDatePart('weekday', this.props.InitSearchFormData.searchParams.returnDate)}</div>
                </div>
              </div>
              {!this.props.InitSearchFormData.searchParams.returnDate ?
                <div className="tap-plus">+</div>
                :
                <div className="row the-date">
                  <span
                    className="tap-date">{this.getDatePart('date', this.props.InitSearchFormData.searchParams.returnDate)}</span>
                  <span
                    className="tap-month">{this.getDatePart('month', this.props.InitSearchFormData.searchParams.returnDate)}</span>
                  <span
                    className="tap-year">{this.getDatePart('year', this.props.InitSearchFormData.searchParams.returnDate)}</span>
                </div>
              }

            </div> : null
          }
        </div>

        <div className="flight-additional-info row">
          <div className="col-xs-12">
            <PassengerChooser searchParams={this.props.InitSearchFormData.searchParams}/>
            <ClassChooser searchParams={this.props.InitSearchFormData.searchParams}/>
          </div>
        </div>

        <div className="search-buttons">
	        
          <button id="search-form-all-flights-button" type="submit" className={
            "big-button search-button " + this.getSubmitButtonDisabledClass()} onClick={this.submitSearchForm(0)}>
          	Search
          </button>
           
				  {/* since we're not in demo any more, get rid of extra demo button */}
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
