
var OrderPanel = React.createClass({

  makeOrderData: function(incData) {
    var fields_data = incData.fieldsData ? incData.fieldsData : {};

    return [
      {id:'FirstName', required: true, title: 'First Name', data: fields_data.FirstName || ''},
      {id:'LastName', required: true, title: 'Last Name', data: fields_data.LastName || ''},
      {id:'Gender', required: true, title: 'Gender', data: fields_data.Gender || ''},
      {id:'DateOfBirth', required: true, type: "date", title: 'Birthday', placeholder: 'YYYY-MM-DD', data: fields_data.DateOfBirth || ''},
      {id:'Address1', required: true, title: 'Address', data: fields_data.Address1 || ''},
      {id:'City', required: true, title: 'City', data: fields_data.City || ''},
      {id:'State', required: true, title: 'State', data: fields_data.State || ''},
      {id:'ZipCode', required: true, title: 'Zip Code', data: fields_data.ZipCode || ''},
      {id:'Country', required: true, title: 'Country Code', data: fields_data.Country || ''},
      {id:'CardType', required: true, title: 'Card Type', data: ''},
      {id:'CardNumber', required: true, type: 'number', title: 'Card Number', data: ''},
      {id:'ExpiryDate', required: true, title: 'Expiration Date', placeholder: 'MM/YYYY', data: ''},
      {id:'CVV', required: true, title: 'CVV', data: ''},
    ];
  },

  getOrder: function() {
    return ClientApi.reqGet('/order?itineraryId='+ encodeURIComponent(this.props.itineraryId));
  },

  postOrder: function() {
    return ClientApi.reqPost('/booking_proc', this.props.orderData.fieldsData);
  },

  execReq: function (event) {
    event.preventDefault();

    if (!$("#form_booking").valid()) {
      return;
    }
    $("#bookingModal").modal('show');

    this.postOrder()
      .then(function (resData) {
        resData.error ? this.props.loadFailed() : this.props.loadSuccess(resData);
        $("#bookingModal").modal('hide');
      }.bind(this))
      .catch(function (error) {
        console.error(error);
        $("#bookingModal").modal('hide');
      });
  },

  componentDidMount: function() {
    clientStore.subscribe(() => console.log('_store:', clientStore.getState()));

    this.getOrder()
      .then(function (resData) {
        resData.error ? this.props.loadFailed() : this.props.loadSuccess(resData);
      }.bind(this))
      .catch(function (error) {
        console.error(error);
      });
  },

  render: function () {

    if (this.props.orderData.error) {
      return <DisplayAlert errorType={this.props.orderData.errorType}/>;
    }

    if (this.props.orderData.action == 'order') {
      if (!this.props.orderData.itineraryData) {
        console.error('Undefined itineraryData');
        return <DisplayAlert />;
      }

      return (
        <div>

          <div className="flight-unit">
            <div className="booking-flight-unit">
              <ResultItem itinerary={this.props.orderData.itineraryData} showFullInfo={true}/>
            </div>
          </div>

          <div className={this.props.orderData.flashMsg ? "warning" : ""} role="alert">{this.props.orderData.flashMsg}</div>

          <div id="user-time-limit-target-div" className="time-limit message hidden">
            <div className="copy">Time limit for getting the fare is <span id="user-time-limit-target"></span> day(s).</div>
          </div>

          <div className="form">
            <div className="page-ti">Billing</div>
            {this.makeOrderData(this.props.orderData).map(
              (item, index) => <OrderPanelElement profileStructure={this.props.orderData.profileStructure} item={item} key={'elem-' + index} panelType="fields"/>
            )}
          </div>

          <div className="buttons">
            <button id="booking_button" className="big-button" onClick={this.execReq}>
              {this.props.specialOrder ? 'Submit' : this.props.orderData.itineraryData.orderPrice}
            </button>
          </div>

        </div>
      );
    }
    if (this.props.orderData.action == 'booking') {
      var _mailto = this.props.orderData.replyTo.match(/(.*)<(.+)>/);

      return (
        <div className="booking-success">

          <div className="e-ticket confirmation">
            <div className="confirm-code">
              <div className="success ti">Booking</div>
              <div className="wrapper">
                <span className="label-ti">Reservation Code:</span>
                <span className="number">{this.props.orderData.bookingRes.PNR}</span>
              </div>
            </div>
          </div>

          <div className="confirm-message">
            <div className="name">Dear&nbsp;{this.props.orderData.fieldsData.FirstName} {this.props.orderData.fieldsData.LastName},</div>
            <div className="thanks">Thank you for choosing Avaea!</div>
            <div className="copy">
              You're all set for your next trip. Your ticket has been issued as an electronic ticket.
              Please check your email for confirmation.
            </div>
          </div>

          <div className="trip ti">Trip Details</div>
          <div className="flight-unit">
            <div id="booked-flight-unit" className="booked-flight-unit">
              <ResultItem itinerary={this.props.orderData.itineraryData} showFullInfo={true}/>
            </div>
          </div>

          <div className="help-contact">
            <span className="copy">Need help?&nbsp;
              <a href={'mailto:'+encodeURIComponent(_mailto[1])+_mailto[2]+'?subject='+encodeURIComponent('Booking Confirmation')}>Email Us</a>
              or call&nbsp;{this.props.orderData.callTo}
            </span>
          </div>

        </div>
      );
    }
    else {
      if (this.props.orderData.action) {
        console.error('Unknown api action', this.props.orderData.action);
        return <DisplayAlert />;
      }
      else {
        return <div className="nothing-found"><div className="copy">Loading..</div></div>
      }
    }
  }

});

const mapStateOrder = function(store) {
  return {
    orderData: store.orderData,
  };
};

const mapDispatchOrder = (dispatch) => {
  return {
    loadSuccess: (data) => {
      dispatch(actionLoadSuccess(data))
    },
    loadFailed: () => {
      dispatch(actionLoadFailed())
    },
  }
};

var OrderPanelContainer = ReactRedux.connect(mapStateOrder, mapDispatchOrder)(OrderPanel);