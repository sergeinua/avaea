
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
    return ClientApi.reqPost('/order?itineraryId='+ encodeURIComponent(this.props.itineraryId));
  },

  postOrder: function() {
    return ClientApi.reqPost('/booking_proc', this.props.orderData.fieldsData);
  },

  execReq: function (event) {
    event.preventDefault();
    /**
     * Added according to DEMO-707
     * @link https://avaeaeng.atlassian.net/browse/DEMO-707
     */
    $.validator.addMethod("lettersonly", function(value, element) {
      return this.optional(element) || /^[a-z\s]+$/i.test(value);
    }, "Please remove any non alphabetical characters from your name");

    /**
     * Client validation during booking of itinerary
     */
    $("#form_booking").validate({
      rules: {
        FirstName: {
          required: true,
          lettersonly: true
        },
        LastName: {
          required: true,
          lettersonly: true
        },
        Gender: {
          required: true
        },
        DateOfBirth: {
          required: true,
          date: true,
          minlength: 10,
          maxlength: 10
        },
        Address1: {
          required: true
        },
        City: {
          required: true
        },
        State: {
          required: true
        },
        Country: {
          required: true
        },
        ZipCode: {
          required: true
        },
        CardType: {
          required: true
        },
        CardNumber: {
          required: true,
          digits: true,
          minlength: 16,
          maxlength: 16
        },
        ExpiryDate: {
          required: true,
          minlength: 7,
          maxlength: 7
        },
        CVV: {
          required: true,
          digits: true,
          minlength: 3,
          maxlength: 3
        }
      },
      errorPlacement: function(error, element) {
        if (element.attr("name") == "FirstName" || element.attr("name") == "LastName" ) {
          error.insertAfter(element);
        }
        // Skip other error messages
      },
      highlight: function(input) {
        $(input).parent().addClass('has-error');
      },
      unhighlight: function(input) {
        $(input).parent().removeClass('has-error');
      },

      // booking modal
      submitHandler: function(form) {
        var _isError = false;

        if ($('.booking .form input').parent().hasClass('has-error')) {
          _isError = true;
          return false;
        }  else {
          $("#bookingModal").modal();
          return true;
        }
      }
    });

    if (!$("#form_booking").valid()) {
      return;
    }
    $("#bookingModal").modal();
    var savedData = JSON.parse(JSON.stringify(this.props));
    this.postOrder()
      .then(function (resData) {
        //FIXME jquery mess
        $("#bookingModal").modal('hide');
        if (!resData.error && resData.bookingId) {
          window.ReactRouter.browserHistory.push('/booking/' + resData.bookingId);
        } else if (resData.flashMsg) {
          savedData.orderData.flashMsg = resData.flashMsg;
          //scroll to page top to show error message after components re-render
          window.scrollTo(0, 0);
          this.props.loadSuccess(savedData.orderData);
        }
      }.bind(this))
      .catch(function (error) {
        console.error(error);
        //FIXME jquery mess
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
        <span>
          <SearchBanner id="bookingModal" text="Booking your trip!"/>

        <form id="form_booking" className="booking">
        <div>

          <div className="flight-unit">
            <div className="booking-flight-unit">
              <ResultItem itinerary={this.props.orderData.itineraryData} showFullInfo={true}/>
            </div>
          </div>

          <div className={this.props.orderData.flashMsg ? "warning warning-booking" : ""} role="alert">{this.props.orderData.flashMsg}</div>

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
        </form>
          {this.props.specialOrder ?
            <OrderSpecialModal />:null
          }
        </span>

      );
    } else {
      if (this.props.orderData.action) {
        console.error('Unknown api action', this.props.orderData.action);
        return <DisplayAlert />;
      } else {
        return <Loader/>
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
