var SearchResult = {};

var NavBar = React.createClass({
  getInitialState: function() {
    return {
      title: this.props.InitResultData.title,
      tiles: this.props.InitResultData.tiles,
      searchParams: this.props.InitResultData.searchParams,
      searchResultLength: this.props.InitResultData.searchResultLength,
    };
  },

  getDefaultProps: function() {
    return {
      user: false
    }
  },

  flightTypeName: {
    round_trip: 'Round trip',
    one_way: 'One way',
  },

  componentDidUpdate: function () {
    $('#nav_slide_menu').offcanvas({
      toggle: false,
      placement: 'left'
    });
  },

  componentWillMount: function () {
    SearchResult.searchResultLength = (newCount) => {
      this.setState({
        searchResultLength: newCount
      });
    }
  },

  handleVoice: function () {
    ActionsStore.changeForm('voice_search');
  },

  handleBackToSearch: function () {
    ActionsStore.changeForm('round_trip');
  },

  handleCalendar: function () {
    ActionsStore.changeCalendarDate();
  },

  handleCancelAirport: function () {
    ActionsStore.changeForm($('#search_form').data('flight-type') || 'round_trip');
  },

  handleClearVoice: function () {
    ActionsStore.ClearVoiceInput();
  },

  handleBackToSearchResult: function () {
    history.back();
    // window.location.href = '/result?s=' + searchId;
  },

  render: function() {
    return (
      <nav className="navbar navbar-default navbar-fixed-top">
        {  this.props.page != 'airport-search'
        && this.props.page != 'order'
        && this.props.page != 'calendar' ?
          <div id="main_title">
            <div className="navbar-header">
              {this.props.user && this.props.page == 'voice_search' ? <div className="back-history" onClick={this.handleBackToSearch}>Back</div> : null}
              {this.props.page == 'calendar' || this.props.page == 'voice_search' ? null:
                <span>
                  <button type="button" className="navbar-toggle pull-left" data-toggle="offcanvas"
                          data-target="#nav_slide_menu" data-canvas="body">
                    <span className="icon-bar"></span>
                    <span className="icon-bar"></span>
                    <span className="icon-bar"></span>
                  </button>
                  {this.props.page == 'result'?
                    <div className="flight-info">
                      <div className="result-search-info-bar">
                        <span className="requested-airports">{ this.state.searchParams.DepartureLocationCode + '-' +  this.state.searchParams.ArrivalLocationCode}</span>
                        <span className="flight-date">
                { moment(this.state.searchParams.departureDate).format('DD MMM') + (this.state.searchParams.returnDate?'-'+moment(this.state.searchParams.returnDate).format('DD MMM'):'') }
              </span>
                        <span className="seating-class">
                { serviceClass[this.state.searchParams.CabinClass] }
              </span>
                        <span className="flight-type">{ this.flightTypeName[this.state.searchParams.flightType] }</span>
                        <span className="passenger-count">{ this.state.searchParams.passengers }</span>
                      </div>
                    </div>:<div className="navbar-brand">Avaea Agent</div>
                  }
                </span>
              }
              {this.props.user && (this.props.page == 'round_trip' || this.props.page == 'one_way') ?
                  <div id="voice_search" className="flight-type-item voice-search-button" onClick={this.handleVoice}><i className="icon-mic"></i></div>:null}
              {this.props.page == 'voice_search' ?
              <div className="clear-textarea" id="clear_button" onClick={this.handleClearVoice}>Start over</div> : null
              }
            </div>

            <div id="nav_slide_menu" className={this.props.page == 'voice_search' ? "voice-search navmenu navmenu-default navmenu-fixed-left offcanvas" : "navmenu navmenu-default navmenu-fixed-left offcanvas"}role="navigation">
                {this.props.user.email ?
                  <ul className="nav navbar-nav">
                    <li><a href="http://www.avaea.com/">Main Search</a></li>
                    <li><a href="http://stage.avaea.com/">Test Search</a></li>
                    <li role="separator" className="divider"></li>
                    <li><a href="/profile/get">Profile</a></li>
                    <li><a href="/site/about">About</a></li>
                    <li><a href="/logout">Log out <b>{ this.props.user.email }</b></a></li>
                  </ul>
                  :
                  <ul className="nav navbar-nav">
                    <li><a href="http://www.avaea.com/">Main Search</a></li>
                    <li><a href="http://stage.avaea.com/">Test Search</a></li>
                    <li><a href="/site/about">About</a></li>
                  </ul>
                }
            </div>
          </div>:null
        }

        {this.props.page == 'airport-search' ?
          <div id="search_title" className="airport-search-panel">
            <div className="navbar-header">
              <div className="airport-search-header">
                <input id="airport-input" type="text" name="airport" placeholder="City, airport code or airport name"/>
                <button type="button" id="search_button_top" className="search_button_top_cancel" onClick={this.handleCancelAirport}>Cancel</button>
              </div>
            </div>
          </div>:null
        }

        {this.props.page == 'calendar'?
          <div id="date_select" className="calendar-header">
            <div className="navbar-header">
              <div className="container-fluid">
                <div className="row">
                    <div className="info"><span className="dep"></span><span className="ret"></span></div>
                    <button type="button" id="date_select_top" className="date_select-button small-button" onClick={this.handleCalendar}>Done</button>
                </div>
              </div>
            </div>
          </div>:null
        }

        {this.props.page == 'order'?
          <div className="booking-panel">
            <div className="navbar-header back-style">
              <div className="container-fluid">
                <div className="row">
                  <div className="back-history" onClick={this.handleBackToSearchResult}>Back</div>
                </div>
              </div>
            </div>
          </div>:null
        }

      </nav>

    )
  }
});

$(document).ready(function() {
  var NavBarData = $('#onlynavbar').attr('page');
  if (typeof NavBarData != 'undefined' && $('#onlynavbar').length) {
    var userData = (typeof NavBarInit != 'undefined' && NavBarInit.user) ? NavBarInit.user : {};
    ReactContentRenderer.render(<NavBar page={NavBarData} user={userData} InitResultData={{}}/>, $('#onlynavbar'));
  }
});
