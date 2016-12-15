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

    ActionsStore.changeForm(this.props.commonData.searchParams.flightType);
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
    },
  }
};

const SearchFormPageContainer = ReactRedux.connect(mapStateCommon, mapDispatchCommon)(SearchFormPage);

export default SearchFormPageContainer;
