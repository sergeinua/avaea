
var SearchFormPage = React.createClass({
  getInitialState: function() {
    var searchParams;
    if (localStorage.getItem('searchParams')) {
      //use data from local storage if exists
      searchParams = JSON.parse(localStorage.getItem('searchParams'));
    } else {
      //use data from server with default/session params if local storage is empty
      searchParams = this.props.InitSearchFormData.searchParams;
    }
    return {
      searchParams: searchParams,
      currentForm: searchParams.flightType,
      airportChoiceTarget: 'DepartureLocationCode'
    };
  },

  componentWillMount: function () {
    ActionsStore.changeForm = (form) => {
      this.setState({currentForm: form.toLowerCase()});

      if (form == 'one_way' || form == 'round_trip') {
        ActionsStore.setFormValue('flightType', form.toLowerCase());
      }
    };

    ActionsStore.getSearchParams = () => {
      return this.state.searchParams;
    };

    ActionsStore.updateFormValues = () => {
      var searchParams = ActionsStore.getSearchParams();
      this.setState({searchParams: searchParams});
    };

    ActionsStore.setFormValue = (target, value) => {
      var searchParams = ActionsStore.getSearchParams();
      searchParams[target] = value;
      ActionsStore.updateFormValues();
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
