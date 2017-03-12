import React from 'react';
import * as ReactRedux from 'react-redux';
import { actionSetCommonVal } from '../../actions.js';
import { unfocusFormForIos, ActionsStore, getDefaultDateSearch } from '../../functions.js';
import { clientStore } from '../../reducers.js';
import TripSearchForm from '../searchform/TripSearchForm.jsx';
import ClassChooser from '../searchform/ClassChooser.jsx';
import PassengerChooser from '../searchform/PassengerChooser.jsx';
import Calendar from '../searchform/Calendar.jsx';
import MultiCityForm from '../searchform/MultiCityForm.jsx';
import VoiceForm from '../searchform/VoiceForm.jsx';
import Typeahead from '../searchform/Typeahead.jsx';
const _  = require('lodash');


var SearchFormPage = React.createClass({

  getInitialState: function() {
    return {
      showPassForm: false,
      showClassForm: false,
      showTypeForm: false,
      isMounted: false
    };
  },

  componentWillMount: function () {
    analytics.page(this.props.location.pathname);

    clientStore.dispatch(actionSetCommonVal('searchParams', getDefaultDateSearch(this.props.commonData.searchParams)));
    ActionsStore.changeForm(this.props.commonData.searchParams.flightType);
  },

  // this is used in a couple of places, should it be global?
  flightTypeName: {
    round_trip: 'Round trip',
    one_way: 'One way',
    multi_city: 'Multi-City',
  },

  changeForm: function(form) {
    return function () {
      ActionsStore.changeForm(form);
      this.handleFormVis('showTypeForm');
    }.bind(this);
  },

  getPasText: function (passengers) {
      let passCount = 1;
      if (passengers) {
        passCount =
          parseInt(passengers.adult) + parseInt(passengers.senior) +
          parseInt(passengers.child) + parseInt(passengers.seatInfant) +
          parseInt(passengers.lapInfant);
      } else {
        passengers = {adult: 1};
      }
      let result = (passCount == 1) ? "Passenger" : "Passengers";
      //init value for the search form
      let _result = [];
      for (let _type in passengers) {
          if (passengers[_type] > 0) {
              _result.push(_type);
          }
      }
      if (_result.length == 1) {
          if (passengers[_result] > 1) {
              _result[0] += 's';
          }
          result = _result[0];
          result = result.replace(/([A-Z])/g, ' $1').trim();
          result = _.upperFirst(result);
          if (result == 'Childs')
              result = 'Children';
      }
      return passCount + ' ' + result;
  },

  componentDidMount() {
    this.setState({isMounted: true});
  },

  componentWillUnmount() {
    this.setState({isMounted: false});
  },

  handleFormVis: function(formType) {
    if (this.state.isMounted) {
      let _currState = !this.state[formType];
      // hiding all the rest forms
      this.setState({
        showPassForm: false,
        showClassForm: false,
        showTypeForm: false,
      });
      this.setState({[formType]: _currState});
    }
  },

  render: function() {
    return (
      <div>
        { this.props.commonData.currentForm != 'voice_search'
          && this.props.commonData.currentForm != 'calendar'
          && this.props.commonData.currentForm != 'airport-search' ?
        <div className="searchnav" >
          <div className="positioner">

            <div className="wrapper trip-type">
              <div id="dropbuttonTripType"
                   className="dropbutton"
                   onClick={() => this.handleFormVis('showTypeForm')}
              >{ this.flightTypeName[this.props.commonData.searchParams.flightType] }</div>
                { this.state.showTypeForm ?
                <div className="dropmenu pretty">
                  <div id="one_way"
                       className={["choice "] + [this.props.commonData.currentForm == 'one_way' ? "active":""]}
                       onClick={this.changeForm('one_way')}>One Way</div>
                  <div id="round_trip"
                       className={["choice "] + [this.props.commonData.currentForm == 'round_trip' ? "active":""]}
                       onClick={this.changeForm('round_trip')}>Round Trip</div>
                  <div id="multi_city"
                       className={["choice "] + [this.props.commonData.currentForm == 'multi_city' ? "active":""]}
                       onClick={this.changeForm('multi_city')}>Multi-City</div>
                </div> /* ends dropmenu */
                : null }
            </div>{/* ends trip-type */}

            <div className="wrapper seat-class">
              <div id="dropButtonSeatClass"
                   className="dropbutton"
                   onClick={() => this.handleFormVis('showClassForm')}
              >{ serviceClass[this.props.commonData.searchParams.CabinClass] }</div>
              { this.state.showClassForm ?
              <div className="dropmenu pretty">
                 <ClassChooser onClick={() => this.handleFormVis('showClassForm')} />
              </div> /* ends dropmenu */
              : null }
            </div>{/* ends seat-class */}

            <div className="wrapper passengers">
              <div id="dropButtonPassengers"
                   className="dropbutton"
                   onClick={() => this.handleFormVis('showPassForm')}
              >{this.getPasText(this.props.commonData.searchParams.passengers)}</div>
              { this.state.showPassForm ?
              <div id="passenger-chooser" className="dropmenu pretty passenger-chooser robust">
                <PassengerChooser
                  searchParams={this.props.commonData.searchParams}
                  onCancel={() => this.handleFormVis('showPassForm')}
                  onDone={() => this.handleFormVis('showPassForm')}
                />
              </div> /* ends dropmenu */
              : null }
            </div>{/* ends passengers */}

          </div>{/* ends positioner */}
        </div> /* ends searchnav */
        : null }

        { this.props.commonData.currentForm == 'multi_city' ?
          <MultiCityForm />
        : null }
        { this.props.commonData.currentForm == 'one_way' || this.props.commonData.currentForm == 'round_trip' ?
          <TripSearchForm />
          : null
        }
        { this.props.commonData.currentForm == 'voice_search' ?
          <VoiceForm />
        : null }
        { this.props.commonData.currentForm == 'calendar' ?
          <Calendar />
          : null
        }
        { this.props.commonData.currentForm == 'airport-search' ?
          <Typeahead target={this.props.commonData.airportChoiceTarget} searchParams={this.props.commonData.searchParams}/>
        : null }
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
    },
  }
};

const SearchFormPageContainer = ReactRedux.connect(mapStateCommon, mapDispatchCommon)(SearchFormPage);

export default SearchFormPageContainer;
