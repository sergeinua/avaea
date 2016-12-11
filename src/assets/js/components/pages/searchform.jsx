import React from 'react';
import * as ReactRedux from 'react-redux';
import { actionSetCommonVal } from '../../actions.js';
import { unfocusFormForIos, ActionsStore } from '../../functions.js';
import TripSearchForm from '../searchform/TripSearchForm.jsx';
import Calendar from '../searchform/Calendar.jsx';
import MultiCityForm from '../searchform/MultiCityForm.jsx';
import VoiceForm from '../searchform/VoiceForm.jsx';
import Typeahead from '../searchform/Typeahead.jsx';

var searchApiMaxDays = 330; // Mondee API restriction for search dates at this moment

var SearchFormPage = React.createClass({

  componentWillMount: function () {
    // DEMO-800 removed mess after not properly closed modal.
    // FIXME remove this after removing jquery modal
    jQuery('.modal-backdrop').remove();
    jQuery('body').removeClass('modal-open');

    ActionsStore.changeForm = (form) => {
      unfocusFormForIos();

      Promise.resolve( this.props.actionSetCommonVal('currentForm', form.toLowerCase()) )
        .then(function () {
          if (form == 'one_way' || form == 'round_trip' || form == 'multi_city') {
            Promise.resolve( ActionsStore.setFormValue('flightType', form.toLowerCase()) );
          }
          else {
            return true;
          }
        })
        .then(function () {
          ActionsStore.validateCalendar();
        });

      ActionsStore.updateNavBarPage(form.toLowerCase());
    };

    ActionsStore.setFormValue = (target, value) => {
      return this.props.actionSetCommonVal(['searchParams', target], value);
    };

    ActionsStore.setTarget = (target) => {
      this.props.actionSetCommonVal('airportChoiceTarget', target);
    };

    ActionsStore.validateCalendar = () => {
      var calendarErrors = {
        isError: false,
        departureDate: false,
        returnDate: false
      };

      var flightType = this.props.commonData.searchParams.flightType || 'round_trip';
      var departureDate = this.props.commonData.searchParams.departureDate;
      var moment_dp = moment(departureDate, "YYYY-MM-DD");
      var returnDate = this.props.commonData.searchParams.returnDate;
      var moment_rp = moment(returnDate, "YYYY-MM-DD");

      var moment_now = moment();
      // Check depart date
      if (moment_dp &&
          (
            moment_dp.isBefore(moment_now, 'day') ||
            moment_dp.diff(moment_now, 'days') >= searchApiMaxDays - 1
          )
      ) {
        calendarErrors.departureDate = true;
        calendarErrors.isError = true;
      }

      // Check return date
      if (flightType == 'round_trip') {
        if (moment_rp && moment_rp.diff(moment_now, 'days') >= searchApiMaxDays - 1) {
          calendarErrors.returnDate = true;
          calendarErrors.isError = true;
        }
      }


      if (!departureDate) {
        calendarErrors.departureDate = true;
        calendarErrors.isError = true;
      }

      // Check existence of the return date for the round trip
      if (this.props.commonData.currentForm == 'round_trip') {
        if (!returnDate) {
          calendarErrors.returnDate = true;
          calendarErrors.isError = true;
        }

        if (moment_dp && moment_rp && moment_rp.isBefore(moment_dp, 'day')) {
          calendarErrors.returnDate = true;
          calendarErrors.isError = true;
        }
      }

      this.props.actionSetCommonVal('calendarErrors', calendarErrors);
    };

    // Get and apply search params from local storage
    let _searchParams;
    if (localStorage.getItem('searchParams')) {
      //use data from local storage if exists
      _searchParams = JSON.parse(localStorage.getItem('searchParams'));
    } else if (InitData.defaultSearch) {
      //use data from server with default/session params if local storage is empty
      _searchParams = InitData.defaultSearch;
    }

    if (_searchParams) {
      Promise.resolve( this.props.actionSetCommonVal('searchParams', _searchParams) )
        .then(function () {
          if (_searchParams.flightType != this.props.commonData.currentForm) {
            ActionsStore.changeForm(_searchParams.flightType);
            return false;
          }
          else {
            ActionsStore.updateNavBarPage(this.props.commonData.currentForm);
            return true;
          }
        }.bind(this))
        .then(function (isValidateCalendar) {
          if (isValidateCalendar && (this.props.commonData.currentForm == 'one_way' || this.props.commonData.currentForm == 'round_trip')) {
            ActionsStore.validateCalendar();
          }
        }.bind(this));
    }
    else {
      ActionsStore.updateNavBarPage(this.props.commonData.currentForm);
      if (this.props.commonData.currentForm == 'one_way' || this.props.commonData.currentForm == 'round_trip') {
        ActionsStore.validateCalendar();
      }
    }
  },

  changeForm: function(form) {
    return function () {
      ActionsStore.changeForm(form);
    }.bind(this);
  },
  render: function() {
    return (
      <div>
        { this.props.commonData.currentForm != 'voice_search' && this.props.commonData.currentForm != 'calendar'  && this.props.commonData.currentForm != 'airport-search' ?
        <nav className="navbar navbar-default searchform-top" >
          <div className="flight-type-form">
            <div id="one_way"
                 className={ this.props.commonData.currentForm == 'one_way' ? "flight-type-item one-way active-choice":"flight-type-item one-way"}
                 onClick={this.changeForm('one_way')}>One way</div>
            <div id="round_trip"
                 className={ this.props.commonData.currentForm == 'round_trip' ? "flight-type-item active-choice":"flight-type-item"}
                 onClick={this.changeForm('round_trip')}>Round trip</div>
            <div id="multi_city"
                 className={ this.props.commonData.currentForm == 'multi_city' ? "flight-type-item multi-city active-choice":"flight-type-item multi-city"}
                 onClick={this.changeForm('multi_city')}>Multi city</div>
          </div>
        </nav>:null
        }
        { this.props.commonData.currentForm == 'multi_city' ?
          <MultiCityForm />
          : null
        }
        { this.props.commonData.currentForm == 'one_way' || this.props.commonData.currentForm == 'round_trip' ?
          <TripSearchForm InitSearchFormData={this.props.commonData} />
          : null
        }
        { this.props.commonData.currentForm == 'voice_search' ?
          <VoiceForm />
          : null
        }
        { this.props.commonData.currentForm == 'calendar' ?
          <Calendar searchParams={this.props.commonData.searchParams}/>
          : null
        }
        { this.props.commonData.currentForm == 'airport-search' ?
          <Typeahead target={this.props.commonData.airportChoiceTarget} searchParams={this.props.commonData.searchParams}/>
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

const mapDispatchCommon = (dispatch) => {
  return {
    actionSetCommonVal: (fieldName, fieldValue) => {
      return dispatch(actionSetCommonVal(fieldName, fieldValue));
    }
  }
};

const SearchFormPageContainer = ReactRedux.connect(mapStateCommon, mapDispatchCommon)(SearchFormPage);

export default SearchFormPageContainer;
