var searchApiMaxDays = 330; // Mondee API restriction for search dates at this moment

var SearchFormPage = React.createClass({
  getInitialState: function() {
    var searchParams = {
      flightType : 'round_trip'
    };
    if (localStorage.getItem('searchParams')) {
      //use data from local storage if exists
      searchParams = JSON.parse(localStorage.getItem('searchParams'));
    } else if (InitData.defaultSearch) {
      //use data from server with default/session params if local storage is empty
      searchParams = InitData.defaultSearch;
    }
    return {
      searchParams: searchParams,
      calendarErrors: {
        departureDate: false,
        returnDate: false
      },
      currentForm: searchParams.flightType,
      airportChoiceTarget: 'DepartureLocationCode'
    };
  },

  componentWillMount: function () {
    // DEMO-800 removed mess after not properly closed modal.
    // FIXME remove this after removing jquery modal
    $('.modal-backdrop').remove();
    $('body').removeClass('modal-open');

    ActionsStore.updateNavBarPage(this.state.currentForm);
    ActionsStore.changeForm = (form) => {
      this.setState(
        {currentForm: form.toLowerCase()},
        () => {
          ActionsStore.updateNavBarSearchParams(this.state.searchParams);
          ActionsStore.validateCalendar();
        }
      );
      ActionsStore.updateNavBarPage(form.toLowerCase());
      if (form == 'one_way' || form == 'round_trip' || form == 'multi_city') {
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

    ActionsStore.validateCalendar = () => {
      var calendarErrors = {
        isError: false,
        departureDate: false,
        returnDate: false
      };

      var flightType = this.state.searchParams.flightType || 'round_trip';
      var departureDate = this.state.searchParams.departureDate;
      var moment_dp = moment(departureDate, "YYYY-MM-DD");
      var returnDate = this.state.searchParams.returnDate;
      var moment_rp = moment(returnDate, "YYYY-MM-DD");

      var moment_now = moment();
      // Check depart date
      if (moment_dp && moment_dp.diff(moment_now, 'days') >= searchApiMaxDays - 1) {
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
      if (this.state.currentForm == 'round_trip') {
        if (!returnDate) {
          calendarErrors.returnDate = true;
          calendarErrors.isError = true;
        }

        if (moment_dp && moment_rp && moment_rp.isBefore(moment_dp, 'day')) {
          calendarErrors.returnDate = true;
          calendarErrors.isError = true;
        }
      }

      this.setState({calendarErrors: calendarErrors});
    };

    ActionsStore.getCalendarErrors = () => {
      return this.state.calendarErrors;
    };

    ActionsStore.updateFormValues();
  },

  changeForm: function(form) {
    return function () {
      ActionsStore.changeForm(form);
    }.bind(this);
  },
  render: function() {
    return (
      <div>
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
