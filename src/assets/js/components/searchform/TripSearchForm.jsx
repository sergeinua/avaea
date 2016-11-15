// Vars
var flashErrorTimeout = 1000;

// For elements with error
var setErrorElement = function (selector) {
  // Logic and animation
  $(selector).addClass('error-elem error-flash');
  // Animation
  setTimeout(function() {
    $(selector).removeClass('error-flash');
  }, flashErrorTimeout);
};

var unsetErrorElement = function (selector) {
  if($(selector).hasClass("error-elem")) {
    $(selector).removeClass("error-elem");
  }
};

var TripSearchForm = React.createClass({
  showCalendar: function () {
    return function () {
      ActionsStore.changeForm('calendar');
    }.bind(this);
  },

  componentWillMount: function () {

    ActionsStore.submitForm = () => {
      if (this.validateForm()) {
        $("#searchBanner").modal();
        if (this.props.InitSearchFormData.currentForm != 'round_trip') {
          ActionsStore.setFormValue('returnDate', '');
        }
        var searchParams = ActionsStore.getSearchParams();
        // save search params to local storage on request
        localStorage.setItem('searchParams', JSON.stringify(searchParams));
        window.location = '/result?s=' + btoa(JSON.stringify(searchParams));
      }
    };

  },

  submitSearchForm: function (topSearchOnly) {
    return function () {
      ActionsStore.setFormValue('topSearchOnly', topSearchOnly);
      ActionsStore.submitForm();
    }.bind(this);
  },

  validateForm: function () {
    var _isError = false;
    var searchParams = ActionsStore.getSearchParams();

    if ($('.search-button').hasClass('disabled')) {
      _isError = true;
    }

    // Check airports selection
    if (searchParams.DepartureLocationCode == '') {
      setErrorElement('#from-area');
      _isError = true;
    }
    if (searchParams.ArrivalLocationCode == '') {
      setErrorElement('#to-area');
      _isError = true;
    }
    if (searchParams.DepartureLocationCode == searchParams.ArrivalLocationCode) {
      setErrorElement('#from-area');
      setErrorElement('#from-area-selected');
      setErrorElement('#to-area');
      setErrorElement('#to-area-selected');
      _isError = true;
    }

    if (!searchParams.passengers) {
      ActionsStore.setFormValue('passengers', 1);
    }

    if (!searchParams.CabinClass) {
      ActionsStore.setFormValue('CabinClass', 'E');
    }
    // Check existence of the return date for the round trip
    if (searchParams.returnDate == '' && this.props.InitSearchFormData.currentForm == 'round_trip') {
      setErrorElement('.flight-date-info-item.ret');
      _isError = true;
    }

    if (searchParams.departureDate == '') {
      setErrorElement('.flight-date-info-item.dep');
      _isError = true;
    } else if (this.props.InitSearchFormData.currentForm == 'round_trip') {
      var returnDate = searchParams.returnDate;
      var departureDate = searchParams.departureDate;
      let _momentRet = returnDate ? moment(returnDate) : '';
      let _momentDep = departureDate ? moment(departureDate) : '';
      if (_momentRet.isBefore(_momentDep, 'day')) {
        setErrorElement('.flight-date-info-item.ret');
        _isError = true;
      }
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
                     className={this.props.InitSearchFormData.searchParams.DepartureLocationCode?"flight-direction-item from sel":"flight-direction-item from"}
                     onClick={this.handleAirportSearch('DepartureLocationCode')}>
                  <div className="flight-direction-item-from-to">From</div>
                  {!this.props.InitSearchFormData.searchParams.DepartureLocationCode ?
                    <span className="plus">+</span>
                    :
                    <div className="search-from">
                      <span id="from-airport-selected">{this.props.InitSearchFormData.searchParams.DepartureLocationCode}</span>
                      <div id="from-city-selected" className="flight-direction-item-from-to-city">{this.props.InitSearchFormData.searchParams.DepartureLocationCodeCity}</div>
                    </div>
                  }
                </div>
              </div>

              <div className="col-xs-6">
                <div id="to-area"
                     className={this.props.InitSearchFormData.searchParams.ArrivalLocationCode?"flight-direction-item to sel":"flight-direction-item to"}
                     onClick={this.handleAirportSearch('ArrivalLocationCode')}>
                  <div className="flight-direction-item-from-to">To</div>
                  {!this.props.InitSearchFormData.searchParams.ArrivalLocationCode ?
                    <span className="plus">+</span>
                    :
                    <div className="search-to">
                      <span id="to-airport-selected">{this.props.InitSearchFormData.searchParams.ArrivalLocationCode}</span>
                      <div  id="to-city-selected" className="flight-direction-item-from-to-city">{this.props.InitSearchFormData.searchParams.ArrivalLocationCodeCity}</div>
                    </div>
                  }
                </div>
              </div>

            </div>
          </div>
        </div>

    <div className="flight-date-info row">

      <div className="flight-date-info-item dep col-xs-6 open-calendar" onClick={this.showCalendar('dep')}>
        <div className="row">
          <div className="col-xs-12">
            <div className="direction label-d">Depart</div>
            <div className="weekday">{this.getDatePart('weekday', this.props.InitSearchFormData.searchParams.departureDate)}</div>
          </div>
        </div>
        {!this.props.InitSearchFormData.searchParams.departureDate ?
          <div className="tap-plus">+</div>
          :
          <div className="row the-date">
            <span className="tap-date">{this.getDatePart('date', this.props.InitSearchFormData.searchParams.departureDate)}</span>
            <span className="tap-month">{this.getDatePart('month', this.props.InitSearchFormData.searchParams.departureDate)}</span>
            <span className="tap-year">{this.getDatePart('year', this.props.InitSearchFormData.searchParams.departureDate)}</span>
          </div>
        }

      </div>

      { this.props.InitSearchFormData.currentForm == 'round_trip' ?
        <div className="flight-date-info-item ret col-xs-6 open-calendar" onClick={this.showCalendar('ret')}>
          <div className="row">
            <div className="col-xs-12">
              <div className="direction label-d">Return</div>
              <div className="weekday">{this.getDatePart('weekday', this.props.InitSearchFormData.searchParams.returnDate)}</div>
            </div>
          </div>
          {!this.props.InitSearchFormData.searchParams.returnDate ?
            <div className="tap-plus">+</div>
            :
            <div className="row the-date">
              <span className="tap-date">{this.getDatePart('date', this.props.InitSearchFormData.searchParams.returnDate)}</span>
              <span className="tap-month">{this.getDatePart('month', this.props.InitSearchFormData.searchParams.returnDate)}</span>
              <span className="tap-year">{this.getDatePart('year', this.props.InitSearchFormData.searchParams.returnDate)}</span>
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
      <button type="submit" className="big-button secondary search-button" onClick={this.submitSearchForm(0)}>All Flights</button>
      <button type="submit" className="big-button search-top-button" onClick={this.submitSearchForm(1)}>Top Flights</button>
    </div>

  </div>
    )
  }
});
