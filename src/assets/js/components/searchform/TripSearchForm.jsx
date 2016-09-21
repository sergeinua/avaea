var TripSearchForm = React.createClass({
  showCalendar: function () {
    return function () {
      ActionsStore.changeForm('calendar');
    }.bind(this);
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
    return result;
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
                <div id="from-area" className="flight-direction-item from" onClick={this.handleAirportSearch('originAirport')}>
                  <div className="flight-direction-item-from-to">From</div>
                  {!this.props.InitSearchFormData.searchParams.DepartureLocationCode ?
                    <span className="plus">+</span> : null
                  }
                  <div className="search-from">
                    <span id="from-airport-selected">{this.props.InitSearchFormData.searchParams.DepartureLocationCode}</span>
                    <div id="from-city-selected" className="flight-direction-item-from-to-city">{this.props.InitSearchFormData.searchParams.departCity}</div>
                  </div>
                </div>
              </div>

              <div className="col-xs-6">
                <div id="to-area" className="flight-direction-item to" onClick={this.handleAirportSearch('destinationAirport')}>
                  <div className="flight-direction-item-from-to">To</div>
                  {!this.props.InitSearchFormData.searchParams.ArrivalLocationCode ?
                    <span className="plus">+</span> : null
                  }
                  <div className="search-to">
                    <span id="to-airport-selected">{this.props.InitSearchFormData.searchParams.ArrivalLocationCode}</span>
                    <div  id="to-city-selected" className="flight-direction-item-from-to-city">{this.props.InitSearchFormData.searchParams.arrivCity}</div>
                  </div>
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
          <div className="tap-plus">+</div> : null
        }
        <div className="row the-date">
          <span className="tap-date">{this.getDatePart('date', this.props.InitSearchFormData.searchParams.departureDate)}</span>
          <span className="tap-month">{this.getDatePart('month', this.props.InitSearchFormData.searchParams.departureDate)}</span>
          <span className="tap-year">{this.getDatePart('year', this.props.InitSearchFormData.searchParams.departureDate)}</span>
        </div>
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
            <div className="tap-plus">+</div> : null
          }
          <div className="row the-date">
            <span className="tap-date">{this.getDatePart('date', this.props.InitSearchFormData.searchParams.returnDate)}</span>
            <span className="tap-month">{this.getDatePart('month', this.props.InitSearchFormData.searchParams.returnDate)}</span>
            <span className="tap-year">{this.getDatePart('year', this.props.InitSearchFormData.searchParams.returnDate)}</span>
          </div>
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
      <button type="submit" className="big-button secondary search-button">All Flights</button>
      <button type="submit" className="big-button search-top-button">Top Flights</button>
    </div>

  </div>
    )
  }
});
