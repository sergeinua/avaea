import React from 'react';
import { browserHistory } from 'react-router';
import Autosuggest from 'react-autosuggest';
import { DateRange } from 'react-date-range';
import ClientApi from '~/_common/api';
import { clientStore } from '../../../reducers.js';
import { actionSetCommonVal } from '../../../actions.js';

import moment from 'moment';

const getSuggestionValue = suggestion => suggestion.value;

// Use your imagination to render suggestions.
const renderSuggestion = suggestion => (
  <div className="suggest-item">
    {suggestion.label}
  </div>
);
const renderSuggestionsContainer = ({ children, ...rest }) => (
  <div className="suggest-container" {...rest}>
    {children}
  </div>
);

let SimpleSearchForm = React.createClass({

  getInitialState: function () {
    let startDate = moment().add(2, 'w');
    let endDate = moment().add(3, 'w');
    return {
      searchParams: {
        DepartureLocationCode: '',
        ArrivalLocationCode: '',
        DepartureLocationCodeCity: '',
        ArrivalLocationCodeCity: '',
        CabinClass: 'E',
        passengers: 1,
        topSearchOnly: 0,
        flightType: 'one_way',
        departureDate: startDate,
        returnDate:  endDate,
        voiceSearchQuery: ''
      },
      DepartureOptions: [],
      ArrivalOptions: [],
      showCalendar: false
    };
  },

  onSuggestionsFromRequested: function () {
    this.getSelectOptions(this.state.searchParams.DepartureLocationCode, 'DepartureOptions');
  },

  onSuggestionsToRequested: function () {
    this.getSelectOptions(this.state.searchParams.ArrivalLocationCode, 'ArrivalOptions');
  },

  componentDidMount: function () {
    this.setDefaultAirport();
  },

  setDefaultAirport: function () {
    ClientApi.reqPost('/ac/getNearestAirport', {}, false)
    .then((json) => {
      if (json.airport) {
        let searchParams = this.state.searchParams;
        searchParams.DepartureLocationCode = json.airport;
        this.setState({searchParams: searchParams});
      }
    })
    .catch(function (error) {
      console.log(error);
    });
  },

  getSelectOptions: function(input, target) {
    ClientApi.reqPost('/ac/airports?q='+input, {}, false)
    .then((json) => {
      let options = [];
      json.map(function (item) {
        let newItem = {};
        newItem.value = item.value;
        newItem.label = '('+item.value+') '+item.city+', '+item.name;
        options.push(newItem);
        return newItem;
      });
      return options;
    }).then((options) => {
      let change = {};
      change[target] = options;
      if(this.isMounted()) {
        this.setState(change);
      }
    })
    .catch(function (error) {
      console.log(error);
    });
  },

  handleChangeFromValue: function (e, item) {
    let searchParams = this.state.searchParams;
    searchParams.DepartureLocationCode = item.newValue || '';
    this.setState({searchParams:searchParams}, function () {
      this.getSelectOptions(this.state.searchParams.DepartureLocationCode, 'DepartureOptions');
    });
  },

  handleChangeToValue: function (e, item) {
    let searchParams = this.state.searchParams;
    searchParams.ArrivalLocationCode = item.newValue || '';
    this.setState({searchParams:searchParams}, function () {
      this.getSelectOptions(this.state.searchParams.ArrivalLocationCode, 'ArrivalOptions');
    });
  },

  handleDateSelect(date){
    let searchParams = this.state.searchParams;
    if (date.startDate.format('YYYY-MM-DD').toString() == date.endDate.format('YYYY-MM-DD').toString()) {
      searchParams.flightType = 'one_way';
    } else {
      searchParams.flightType = 'round_trip';
    }
    searchParams.departureDate = date.startDate;
    searchParams.returnDate = date.endDate;
    this.setState({searchParams:searchParams});
  },

  showCalendar: function () {
    this.setState({showCalendar: true});
  },

  hideCalendar: function () {
    this.setState({showCalendar: false});
  },

  getDatesValue: function () {
    const format = 'MMMM Do';
    if (this.state.searchParams.departureDate.format('YYYY-MM-DD').toString() == this.state.searchParams.returnDate.format('YYYY-MM-DD').toString()) {
      return this.state.searchParams.departureDate.format(format).toString();
    } else {
      return this.state.searchParams.departureDate.format(format).toString()
        + ' - '
        + this.state.searchParams.returnDate.format(format).toString();
    }
  },

  submitForm: function () {
    let searchParams = this.state.searchParams;

    searchParams.departureDate = searchParams.departureDate.format('YYYY-MM-DD').toString();
    searchParams.returnDate = searchParams.returnDate.format('YYYY-MM-DD').toString();
    searchParams.DepartureLocationCode = searchParams.DepartureLocationCode.toUpperCase();
    searchParams.ArrivalLocationCode = searchParams.ArrivalLocationCode.toUpperCase();

    if (searchParams.departureDate == searchParams.returnDate) {
      searchParams.returnDate = '';
    }

    localStorage.setItem('searchParams', JSON.stringify(searchParams));
    clientStore.dispatch(actionSetCommonVal('searchParams', searchParams));

    browserHistory.push(
      {
        pathname: '/result',
        query: {
          s: btoa(JSON.stringify(searchParams))
        }
      }
    );
  },

  render: function () {
    const valueFrom = this.state.searchParams.DepartureLocationCode;
    const valueTo = this.state.searchParams.ArrivalLocationCode;

    return (
      <form>
        <div className="wrapper">
          <div className="ti">Where I want to go</div>
          <div className="loc-holder">
          		<div className="positioner">
		            <Autosuggest
		              suggestions={this.state.DepartureOptions}
		              onSuggestionsFetchRequested={this.onSuggestionsFromRequested}
		              onSuggestionsClearRequested={this.onSuggestionsFromRequested}
		              getSuggestionValue={getSuggestionValue}
		              renderSuggestion={renderSuggestion}
		              inputProps={{
		                value: valueFrom,
		                onChange: this.handleChangeFromValue
		              }}
		              onChange={this.handleChangeFromValue}
		              renderSuggestionsContainer={renderSuggestionsContainer}
		            />
	            </div>
	            <div className="react-autosuggest__container copy"><span>to</span></div>
	            <div className="positioner">
		            <Autosuggest
		              suggestions={this.state.ArrivalOptions}
		              onSuggestionsFetchRequested={this.onSuggestionsToRequested}
		              onSuggestionsClearRequested={this.onSuggestionsToRequested}
		              getSuggestionValue={getSuggestionValue}
		              renderSuggestion={renderSuggestion}
		              inputProps={{
		                value: valueTo,
		                onChange: this.handleChangeToValue
		              }}
		              onChange={this.handleChangeToValue}
		              renderSuggestionsContainer={renderSuggestionsContainer}
		            />
	            </div>
          </div>
          <div className="ti">When</div>
          <div className="date-holder">
            <input type="text" readOnly value={this.getDatesValue()} onFocus={this.showCalendar}/>
            <div id="simple-search-form-cal-id" className={this.state.showCalendar ? "simple-cal":"hidden"}>
              <DateRange
                linkedCalendars={ true }
                startDate={ this.state.searchParams.departureDate }
                endDate={ this.state.searchParams.returnDate }
                shownDate={moment()}
                offsetPositive={true}
                disableDaysBeforeToday={true}
                onInit={this.handleDateSelect}
                onChange={this.handleDateSelect}
              />
              <span onClick={this.hideCalendar} className="close-x"></span>
            </div>
          </div>
        </div>
        <a className="buttonly" onClick={this.submitForm}>Try it</a>
      </form>
    )
  }
});

export default SimpleSearchForm;
