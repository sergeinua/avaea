
var SearchFormPage = React.createClass({
  getInitialState: function() {
    //FIXME get rid from jquery
    $('#search_form').data('flight-type', "round_trip");
    return {
      searchParams: this.props.InitSearchFormData.searchParams,
      currentForm: "round_trip",
      airportChoiceTarget: 'originAirport'
    };
  },

  componentWillMount: function () {
    ActionsStore.changeForm = (form) => {
      this.setState({currentForm: form});
      //FIXME get rid from jquery
      if (form == 'one_way' || form == 'round_trip') {
        $('#search_form').data('flight-type', form);
      }
      $('#flightType').val(form);
    };

    ActionsStore.updateFormValues = () => {
      //FIXME get rid from jquery
      let formValues = {
        DepartureLocationCode: ($('#originAirport').length ? $('#originAirport').val():''),
        departCity: ($('#originAirport').attr('city') ? $('#originAirport').attr('city'):''),
        ArrivalLocationCode: ($('#destinationAirport').length ? $('#destinationAirport').val():''),
        arrivCity: ($('#destinationAirport').attr('city') ? $('#destinationAirport').attr('city'):''),
        departureDate: ($('#departureDate').length ? $('#departureDate').val():''),
        returnDate: ($('#returnDate').length ? $('#returnDate').val():''),
        preferedClass: ($('#preferedClass').length ? $('#preferedClass').val():''),
        topSearchOnly: ($('#topSearchOnly').length ? $('#topSearchOnly').val():''),
        passengers: ($('#passengers').length ? $('#passengers').val():''),
        flightType: ($('#flightType').length ? $('#flightType').val():''),
        voiceSearchQuery: ($('#voiceSearchQuery').length ? $('#voiceSearchQuery').val():'')
      };
      this.setState({searchParams: formValues});
    };

    ActionsStore.setTarget = (target) => {
      this.setState({airportChoiceTarget: target});
    };

    ActionsStore.changeCalendarDate = () => {
      finalizeValues();
      ActionsStore.updateFormValues();
    };
    ActionsStore.updateFormValues();
  },
  getUser: function () {
    return this.props.InitSearchFormData.user;
  },
  changeForm: function(form) {
    // var component = this;
    return function () {
      ActionsStore.changeForm(form);
    }.bind(this);
  },
  render: function() {
    return (
      <div>
        <NavBar page={this.state.currentForm} user={this.getUser()} InitResultData={this.state}/>
        { this.state.currentForm != 'voice_search' && this.state.currentForm != 'calendar'  && this.state.currentForm != 'airport-search' ?
        <nav className="navbar navbar-default searchform-top" >
          <div className="flight-type-form">
            <div id="one_way"
                 className={ this.state.currentForm == 'one_way' ? "flight-type-item one-way active-choice":"flight-type-item one-way"}
                 onClick={this.changeForm('one_way')}>One way</div>
            <div id="round_trip"
                 className={ this.state.currentForm == 'round_trip' ? "flight-type-item active-choice":"flight-type-item"}
                 onClick={this.changeForm('round_trip')}>Round trip</div>
            <div id="multi_city"
                 className={ this.state.currentForm == 'multi_city' ? "flight-type-item multi-city active-choice":"flight-type-item multi-city"}
                 onClick={this.changeForm('multi_city')}>Multi city</div>
          </div>
        </nav>:null
        }
        { this.state.currentForm == 'multi_city' ?
          <MultiCityForm />
          : null
        }
        { this.state.currentForm == 'one_way' || this.state.currentForm == 'round_trip' ?
          <TripSearchForm InitSearchFormData={this.state} />
          : null
        }
        { this.state.currentForm == 'voice_search' ?
          <VoiceForm />
          : null
        }
        { this.state.currentForm == 'calendar' ?
          <Calendar />
          : null
        }
        { this.state.currentForm == 'airport-search' ?
          <Typeahead target={this.state.airportChoiceTarget}/>
          : null
        }
        <SearchBanner/>
      </div>
    )
  }
});

function renderSearchFormPage(InitSearchFormData) {
  if ($('#searchformpage').length) {
    ReactContentRenderer.render(<SearchFormPage InitSearchFormData = {InitSearchFormData}/>, $('#searchformpage'));
  }
}

$(document).ready(function() {
  if (typeof InitSearchFormData != 'undefined') {
    renderSearchFormPage(InitSearchFormData);
  }
});
