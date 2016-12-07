var Link = window.ReactRouter.Link;

var NavBar = React.createClass({
  getInitialState: function() {
    return {
      searchParams: {},
      page: this.props.page || ''
    };
  },

  getUser: function () {
    //FIXME get rid from global var
    return this.props.user || InitData.user || false;
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
      placement: 'left',
      autohide: true
    });
    $('#nav_slide_menu a')
      .click(function () {
        $('#nav_slide_menu').offcanvas('hide');
      });
  },

  componentWillMount: function () {
    clientStore.subscribe(() => console.log('_storeNav:', clientStore.getState())); // Need !
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
    window.ReactRouter.browserHistory.push('/result');
  },

  handleBackToSearchForm: function () {
    window.ReactRouter.browserHistory.push('/search');
  },

  render: function() {
    return (
      <nav className="navbar navbar-default navbar-fixed-top">
        {  this.props.commonData.page != 'airport-search'
        && this.props.commonData.page != 'order'
        && this.props.commonData.page != 'calendar' ?
          <div id="main_title">
            <div className="navbar-header">
              {this.getUser() && this.props.commonData.page == 'voice_search' ? <div className="back-history" onClick={this.handleBackToSearch}>Back</div> : null}
              {this.props.commonData.page == 'calendar' || this.props.commonData.page == 'voice_search' ? null:
                <span>
                  <button type="button" className="navbar-toggle pull-left" data-toggle="offcanvas"
                          data-target="#nav_slide_menu" data-canvas="body">
                    <span className="icon-bar"></span>
                    <span className="icon-bar"></span>
                    <span className="icon-bar"></span>
                  </button>
                  {this.props.commonData.page == 'result'?
                    <div className="flight-info">
                      <div className="result-search-info-bar" onClick={this.handleBackToSearchForm}>
                        <span className="requested-airports">{ this.props.commonData.searchParams.DepartureLocationCode + '-' +  this.props.commonData.searchParams.ArrivalLocationCode}</span>
                        <span className="flight-date">
                { moment(this.props.commonData.searchParams.departureDate).format('DD MMM') + (this.props.commonData.searchParams.returnDate?'-'+moment(this.props.commonData.searchParams.returnDate).format('DD MMM'):'') }
              </span>
                        <span className="seating-class">
                { serviceClass[this.props.commonData.searchParams.CabinClass] }
              </span>
                        <span className="flight-type">{ this.flightTypeName[this.props.commonData.searchParams.flightType] }</span>
                        <span className="passenger-count">{ this.props.commonData.searchParams.passengers }</span>
                      </div>
                    </div>:<div className="navbar-brand">Avaea Agent</div>
                  }
                </span>
              }
              {this.getUser() && (this.props.commonData.page == 'round_trip' || this.props.commonData.page == 'one_way') ?
                  <div id="voice_search" className="flight-type-item voice-search-button" onClick={this.handleVoice}><i className="icon-mic"></i></div>:null}
              {this.props.commonData.page == 'voice_search' ?
              <div className="clear-textarea" id="clear_button" onClick={this.handleClearVoice}>Start over</div> : null
              }
            </div>

            <div id="nav_slide_menu" className={this.props.commonData.page == 'voice_search' ? "voice-search navmenu navmenu-default navmenu-fixed-left offcanvas" : "navmenu navmenu-default navmenu-fixed-left offcanvas"} role="navigation">
                {this.getUser().email ?
                  <ul className="nav navbar-nav">
                    <li><a href="http://www.avaea.com/">Main Search</a></li>
                    <li><a href="http://stage.avaea.com/">Test Search</a></li>
                    <li role="separator" className="divider"></li>
                    <li><Link to="/profile">Profile</Link></li>
                    <li><a href="/logout">Log out <b>{ this.getUser().email }</b></a></li>
                  </ul>
                  :
                  <ul className="nav navbar-nav">
                    <li><a href="http://www.avaea.com/">Main Search</a></li>
                    <li><a href="http://stage.avaea.com/">Test Search</a></li>
                  </ul>
                }
            </div>
          </div>:null
        }

        {this.props.commonData.page == 'airport-search' ?
          <div id="search_title" className="airport-search-panel">
            <div className="navbar-header">
              <div className="airport-search-header">
                <input id="airport-input" type="text" name="airport" placeholder="City, airport code or airport name"/>
                <button type="button" id="search_button_top" className="search_button_top_cancel" onClick={this.handleCancelAirport}>Cancel</button>
              </div>
            </div>
          </div>:null
        }

        {this.props.commonData.page == 'calendar'?
          <div id="date_select" className="calendar-header">
            <div className="navbar-header">
              <div className="container-fluid">
                <div className="row">
                    <div className="info">
                      <span className="dep"></span>
                      {
                        this.props.commonData.searchParams.flightType === 'round_trip' ?
                        <span className="ret"></span>  : ''
                      }
                      </div>
                    <button type="button" id="date_select_top" className="date_select-button small-button" onClick={this.handleCalendar}>Done</button>
                </div>
              </div>
            </div>
          </div>:null
        }

        {this.props.commonData.page == 'order'?
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

const mapStateCommon = function(store) {
  return {
    commonData: store.commonData,
  };
};

const NavBarContainer = ReactRedux.connect(mapStateCommon)(NavBar);


$(document).ready(function() {
  var NavBarData = $('#onlynavbar').attr('page');
  if (typeof NavBarData != 'undefined' && $('#onlynavbar').length) {
    var userData = (typeof NavBarInit != 'undefined' && NavBarInit.user) ? NavBarInit.user : {};
    ReactContentRenderer.render(
      <ReactRedux.Provider store={clientStore}><NavBarContainer page={NavBarData} user={userData} InitResultData={{}}/></ReactRedux.Provider>,
      $('#onlynavbar')
    );
  }
});
