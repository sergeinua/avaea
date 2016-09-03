var ResultItem = React.createClass({
  getInitialState: function() {
    var searchId = $('#searchId').val();
    return {
      sRes: this.props.itinerary,
      fullinfo: false,
      searchId: searchId
    };
  },

  toggleFullInfo: function () {
    var itineraryId = this.state.sRes.id;
    return function() {
      var newVal = !this.state.fullinfo;
      this.setState({fullinfo: newVal});

      if (newVal) {
        logAction('on_itinerary_purchase', {
          action: 'itinerary_expanded',
          itinerary: {
            id: itineraryId
          }
        });
      }

    }.bind(this);
  },

  showPrice: function () {
    if (this.state.sRes.currency == 'USD') {
      return '$' + Math.round(this.state.sRes.price);
    } else {
      return Math.round(this.state.sRes.price) + ' ' +  this.state.sRes.currency;
    }
  },

  showThumbsUp: function() {
    if (this.state.sRes.smartRank <= 3 && this.state.sRes.information && this.state.sRes.information.length) {
      return <span className="glyphicon glyphicon-thumbs-up clickable" data-toggle="modal" data-target={'[data-id=' + this.state.sRes.id + ']'}><ModalFlightInfo id={this.state.sRes.id} info={this.state.sRes}/></span>
    }
    return null;
  },

  showNoStops: function(pair) {
    if (pair.noOfStops > 0) {
      return <span className="arr-connects"><span className="connections">{pair.noOfStops}</span></span>
    }
    return <span className="arr-connects-none"></span>
  },

  handleBuyButton: function(id, searchId, isSpecial) {
    return function() {
      location.href = '/order?&id=' + id
        + '&searchId='+ searchId
        + (isSpecial?'&special=1':'');
    }.bind(this);
  },

  render() {
    var showNoStops = this.showNoStops;
    return (
      <div id={this.state.sRes.id} className={"col-xs-12 itinerary " + this.state.sRes.filterClass}>

    <div className="row title">
      <div className="col-xs-12 itinerary-airline col-from-to">
        <span className="itinerary-airline-icon"
              style={{backgroundPosition: "0 -" + InitResultData.iconSpriteMap[this.state.sRes.citypairs[0].from.airlineCode] * 15 + "px"}}
              alt={ this.state.sRes.citypairs[0].from.airlineCode }
              title={ this.state.sRes.citypairs[0].from.airline }>
        </span>
        <span className="airline-text">{ this.state.sRes.citypairs[0].from.airline }</span>
        {this.showThumbsUp()}
      </div>
    </div>

    <div className="row">
      <div className="col-xs-9"  id={ this.state.sRes.id } style={{"lineHeight": "0.86"}} onClick={this.toggleFullInfo()}>
        { this.state.sRes.citypairs.map(function (pair, i) {
        return <div className="itinerary-info" key={"itin-info-" +  i}>
          <div className="col-xs-3 departLoc">
            {pair.from.time + ' ' + pair.from.code}</div>
          <div className="col-xs-2 connections text-center">{showNoStops(pair)}</div>
          <div className="col-xs-3 arriveLoc">{ pair.to.time + ' ' + pair.to.code }</div>
          <div className="col-xs-3 duration" dangerouslySetInnerHTML={ createMarkup(pair.duration) }></div>
        </div>
        }) }
      </div>

      <div className="col-xs-3 buy-button">
        <div className="btn-group text-nowrap buy-button-group">
          <button id="buy-button-i" className="btn btn-sm btn-primary buy-button-price" onClick={this.handleBuyButton(this.state.sRes.id, this.state.searchId, false)}>{this.showPrice()}</button>
          <button type="button" className="btn btn-sm btn-primary dropdown-toggle buy-button-arrow" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            <span className="caret"></span>
          </button>
          <ul className="dropdown-menu">
            <li><a id="buy-cron-button-" href="#" onClick={this.handleBuyButton(this.state.sRes.id, this.state.searchId, true)} className="our-dropdown text-center">or better</a></li>
          </ul>
        </div>
      </div>
    </div>

    { (this.state.fullinfo ?
      <Citypairs citypairs={this.state.sRes.citypairs} information={this.state.sRes.information}/>
      : ''
    )}

  </div>
    )
  }

});
