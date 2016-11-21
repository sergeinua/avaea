// Vars
var flashErrorTimeout = 1000;

var TripSearchForm = React.createClass({
  getInitialState: function () {
    return {
      '.flight-date-info-item.dep': {
        isError: false,
        isErrorFlash: false
      },
      '.flight-date-info-item.ret': {
        isError: false,
        isErrorFlash: false
      },
    }
  },

  showCalendar: function () {
    return function () {
      ActionsStore.changeForm('calendar');
    }.bind(this);
  },

  componentWillMount: function () {

    ActionsStore.validateCalendar();
    ActionsStore.submitForm = () => {
      if (this.validateForm()) {
        if (this.props.InitSearchFormData.currentForm != 'round_trip') {
          ActionsStore.setFormValue('returnDate', '');
        }
        var searchParams = JSON.stringify(ActionsStore.getSearchParams());
        // save search params to local storage on request
        localStorage.setItem('searchParams', searchParams);
        window.ReactRouter.browserHistory.push('/result?s=' + btoa(searchParams));
      }
    };

  },

  submitSearchForm: function (topSearchOnly) {
    return function () {
      ActionsStore.setFormValue('topSearchOnly', topSearchOnly);
      ActionsStore.submitForm();
    }.bind(this);
  },
// For elements with error

  setErrorElement: function (stateFieldName) {
    // Logic and animation
    function createStateFieldsUpdate(state, propertyName, toUpdate) {
      var newStateUpdate = {};
      newStateUpdate[propertyName] = {};
      Object.keys(state[propertyName]).forEach(function (oldProperty){
        newStateUpdate[propertyName][oldProperty] = state[propertyName][oldProperty];
      });

      Object.keys(toUpdate).forEach(function (toUpdatePropertyName) {
        newStateUpdate[propertyName][toUpdatePropertyName] = toUpdate[toUpdatePropertyName];
      });
      return newStateUpdate;
    }

    this.setState(
      createStateFieldsUpdate(this.state, stateFieldName, {isError: true, isErrorFlash: true})
    );

    var self = this;
    var removeFlashErrorCallback = function () {
      var property = self.state[stateFieldName];
      if (property) {
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
    var _isError = false;
    ActionsStore.getSearchParams();
    ActionsStore.validateCalendar();
    var calendarErrors = ActionsStore.getCalendarErrors();
    var searchParams = ActionsStore.getSearchParams();

    if (calendarErrors.isError) {
      _isError = true;
    }

    // Check airports selection
    if (searchParams.DepartureLocationCode == '') {
      this.setErrorElement('#from-area');
      _isError = true;
    }
    if (searchParams.ArrivalLocationCode == '') {
      this.setErrorElement('#to-area');
      _isError = true;
    }
    if (searchParams.DepartureLocationCode == searchParams.ArrivalLocationCode) {
      this.setErrorElement('#from-area');
      //@TODO: find missed DOM element
      // setErrorElement('#from-area-selected');
      this.setErrorElement('#to-area');
      //@TODO: find missed DOM element
      // setErrorElement('#to-area-selected');
      _isError = true;
    }

    if (!searchParams.passengers) {
      ActionsStore.setFormValue('passengers', 1);
    }

    if (!searchParams.CabinClass) {
      ActionsStore.setFormValue('CabinClass', 'E');
    }

    if (calendarErrors.returnDate) {
      this.setErrorElement('.flight-date-info-item.ret');
      _isError = true;
    }

    if (calendarErrors.departureDate) {
      this.setErrorElement('.flight-date-info-item.dep');
      _isError = true;
    }

    return !_isError;
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
    var calendarErrors = ActionsStore.getCalendarErrors();
    return calendarErrors.isError ? 'disabled ': '';
  },

  handleAirportSearch: function (target) {
    return function () {
      ActionsStore.changeForm('airport-search');
      ActionsStore.setTarget(target);
    }.bind(this);
  },

  render() {
    return (
      <div className="form-fields">

        <div className="row text-center flight-direction">
          <div className="col-xs-12 clearfix flight-direction-form">
            <div className="row clearfix">

              <div className="col-xs-6">
                <div id="from-area"
                     className={this.props.InitSearchFormData.searchParams.DepartureLocationCode ? "flight-direction-item from sel" : "flight-direction-item from" + " " + this.getErrorClass('#from-area')}
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
                     className={this.props.InitSearchFormData.searchParams.ArrivalLocationCode ? "flight-direction-item to sel" : "flight-direction-item to" +
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
                <div
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
                  <div
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
            <PassengerChooser passengerVal={this.props.InitSearchFormData.searchParams.passengers || 1}/>
            <ClassChooser classVal={this.props.InitSearchFormData.searchParams.CabinClass || 'E'}/>
          </div>
        </div>

        <div className="search-buttons">
          <button type="submit" className={
            "big-button secondary search-button " + this.getSubmitButtonDisabledClass()} onClick={this.submitSearchForm(0)}>All
            Flights
          </button>
          <button type="submit" className={"big-button search-top-button " + this.getSubmitButtonDisabledClass()} onClick={this.submitSearchForm(1)}>Top
            Flights
          </button>
        </div>

      </div>
    )
  }
});
