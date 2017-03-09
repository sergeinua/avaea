import React from 'react';
import * as ReactRedux from 'react-redux';
import ClientApi from '../_common/api.js';
import DisplayAlert from '../_common/DisplayAlert.jsx';
import SearchBanner from '../searchform/SearchBanner.jsx';
import ResultItemContainer from '../search/ResultItem.jsx';
import OrderSpecialModal from './OrderSpecialModal.jsx';
import OrderPanelElement from './OrderPanelElement.jsx';
import Loader from '../_common/Loader.jsx';
import {actionLoadOrderSuccess, actionLoadOrderFailed, actionSetOrderVal} from '../../actions.js';
import { browserHistory, hashHistory } from 'react-router';
import { supportsHistory } from 'history/lib/DOMUtils';
import PassengerItemContainer from './PassengerItem.jsx';
import luhn from 'luhn';
import postalCodes from 'postcode-validator';
import { ActionsStore } from '../../functions.js';
import OrderPanelElementCountry from './OrderPanelElementCountry';
import OrderPanelElementState from './OrderPanelElementState';
import moment from 'moment';

const historyStrategy = supportsHistory() ? browserHistory : hashHistory;
const STATES = require('../../fixtures/countryStates');

let OrderPanel = React.createClass({

  makeOrderData: function(incData) {
    let fields_data = incData.fieldsData ? incData.fieldsData : {};

    return [
      {id:'FirstName', required: true, title: 'First Name', data: fields_data.FirstName || ''},
      {id:'LastName', required: true, title: 'Last Name', data: fields_data.LastName || ''},
      {id:'Country', required: true, title: 'Country', data: fields_data.Country || ''},
      {id:'Address1', required: true, title: 'Address', data: fields_data.Address1 || ''},
      {id:'City', required: true, title: 'City', data: fields_data.City || ''},
      {id:'State', required: (STATES.STATES[this.props.orderData.fieldsData.Country] && true), title: 'State', data: fields_data.State || ''},
      {id:'ZipCode', required: true, title: 'Zip Code', data: fields_data.ZipCode || ''},
      {id:'CardType', required: true, title: 'Card Type', data: ''},
      {id:'CardNumber', required: true, type: 'number', title: 'Card Number', data: ''},
      {id:'ExpiryDate', required: true, title: 'Expiration Date', placeholder: 'MM/YYYY', data: ''},
      {id:'CVV', required: true, title: 'CVV', data: ''},
      {id:'email', required: true, title: 'Where should we send the Confirmation email?', placeholder: 'Email address', data: fields_data.email || ''}
    ];
  },

  makePassengerData: function(incData, index) {

    let fields_data = incData ? incData : {};

    return [
      {
        id:'passengers['+index+'].FirstName',
        required: true,
        title: 'First Name',
        data: fields_data['passengers['+index+'].FirstName'] || '',
        forcedUpdate: fields_data['passengers['+index+'].FirstName'] || ''
      },
      {
        id:'passengers['+index+'].LastName',
        required: true,
        title: 'Last Name',
        data: fields_data['passengers['+index+'].LastName'] || '',
        forcedUpdate: fields_data['passengers['+index+'].LastName'] || ''
      },

      {
        id:'passengers['+index+'].Gender',
        required: true,
        title: 'Gender',
        type: 'radio',
        data: fields_data['passengers['+index+'].Gender'] || '',
        forcedUpdate: fields_data['passengers['+index+'].Gender'] || ''
      },

      {
        id:'passengers['+index+'].DateOfBirth',
        required: true,
        type: "date",
        title: 'Birthday',
        placeholder: 'YYYY-MM-DD',
        data: fields_data['passengers['+index+'].DateOfBirth'] || '',
        forcedUpdate: fields_data['passengers['+index+'].DateOfBirth'] || ''
      }
    ];
  },

  getOrder: function() {
    return ClientApi.reqPost('/order?itineraryId='+ encodeURIComponent(this.props.itineraryId));
  },

  postOrder: function() {
    /* TODO: need to be refactored when the form will return normal array of passengers */
    let fieldsData = Object.assign({}, this.props.orderData.fieldsData);
    let passengers = [];
    for (let i = 1; i <= this.props.commonData.searchParams.passengers; i++) {
      passengers.push({
        FirstName: this.props.orderData.fieldsData["passengers["+i+"].FirstName"],
        LastName: this.props.orderData.fieldsData["passengers["+i+"].LastName"],
        Gender: this.props.orderData.fieldsData["passengers["+i+"].Gender"],
        DateOfBirth: this.props.orderData.fieldsData["passengers["+i+"].DateOfBirth"]
      });
    }
    fieldsData.passengers = passengers;
    return ClientApi.reqPost('/booking_proc', fieldsData);
  },

  execReq: function (event) {
    event.preventDefault();
    this.props.actionSetOrderVal('flashMsg', '');

    this.props.actionSetOrderVal('formMsg', '');

    $.validator.addMethod("requiredAndTrim", function(value, element) {
      return !!value.trim();
    });

    $.validator.addMethod("checkExpDate", function(value, element) {
      if (/^(0[1-9]|1[12])[\\/](20[1-9]\d)$/.test(value)) {
        let expDate = moment(value, 'MM/YYYY').endOf('month');
        let now = moment.utc();
        return expDate.isAfter(now);
      }
      return false;
    });

    $.validator.addMethod("validateUserNames", function(value, element) {
      value = value.trim();
      return (value.length > 1) && /^[a-z\-']+$/i.test(value);
    });

    $.validator.addMethod("Trim", function(value, element) {
      return value.trim();
    });

    $.validator.addMethod("requiredPhone", function(value, element) {
      return /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\./0-9]*$/.test(value) && value.replace(/[^0-9]/g,'').length >= 10;
    });

    $.validator.addMethod("luhnChecksum", function( value, element ) {
      return luhn.validate(value);
    });

    let countryCode = '';
    if (typeof this.props.orderData.fieldsData.Country !== 'undefined') {
      countryCode = this.props.orderData.fieldsData.Country;
    }
    $.validator.addMethod("postalCode", function( value, element ) {
      if (countryCode) {
        return postalCodes.validate(value, countryCode);
      }
      return false;
    });

    /**
     * Client validation during booking of itinerary
     */
    let validationRules = {
      rules: {
        FirstName: {
          validateUserNames: true
        },
        LastName: {
          validateUserNames: true
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
          requiredAndTrim: true
        },
        City: {
          requiredAndTrim: true
        },
        State: {
          requiredAndTrim: STATES.STATES[this.props.orderData.fieldsData.Country] && true
        },
        Country: {
          requiredAndTrim: true
        },
        ZipCode: {
          requiredAndTrim: true,
          postalCode: true
        },
        CardType: {
          required: true
        },
        CardNumber: {
          required: true,
          digits: true,
          luhnChecksum : true,
          minlength: 16,
          maxlength: 16
        },
        ExpiryDate: {
          requiredAndTrim: true,
          checkExpDate: true,
          minlength: 7,
          maxlength: 7
        },
        CVV: {
          required: true,
          digits: true,
          minlength: 3,
          maxlength: 3
        },
        email: {
          required: true,
          email: true
        }
      },
      messages: {
        FirstName: "Must not have be empty or have invalid characters",
        LastName: "Must not have be empty or have invalid characters",
        ZipCode: "Please enter valid zip code",
        CardNumber: "Please enter a valid credit card number",
        ExpiryDate: "Please enter a valid expiration date",
        CVV: "Please enter 3 digits",
        "passengers[1].phone": "Please enter a valid phone number",
        email: "Please enter valid email address"
      },
      errorPlacement: function(error, element) {
        let _elem_name = element.attr('name');
        if (['Country','Address1','City','State','CardType','ExpiryDate'].indexOf(_elem_name) != -1 || /DateOfBirth/.test(_elem_name)) {
          return; // Skip custom error message
        }
        if (/Gender/.test(_elem_name)) {
          error.insertBefore(element)
        } else {
          error.insertAfter(element);
        }
      },
      highlight: function(input) {
        $(input).parent().addClass('has-error');
      },
      unhighlight: function(input) {
        $(input).parent().removeClass('has-error');
      },

      // booking modal
      submitHandler: function(form) {
        let _isError = false;

        if ($('.booking .form input').parent().hasClass('has-error')) {
          _isError = true;
          return false;
        }  else {
          $("#bookingModal").modal({
            backdrop: 'static',
            keyboard: false
          });
          return true;
        }
      }
    };

    for (let i = 1; i <= this.props.commonData.searchParams.passengers; i++) {
      validationRules.rules["passengers["+i+"].FirstName"] = {
        validateUserNames: true
      };
      validationRules.messages["passengers["+i+"].FirstName"] = validationRules.messages.FirstName;

      validationRules.rules["passengers["+i+"].LastName"] = {
        validateUserNames: true
      };
      validationRules.messages["passengers["+i+"].LastName"] = validationRules.messages.LastName;

      validationRules.rules["passengers["+i+"].Gender"] = {
        required: true
      };
      validationRules.rules["passengers["+i+"].DateOfBirth"] = {
        required: true,
        date: true,
        minlength: 10,
        maxlength: 10
      };
      if (i == 1) {
        validationRules.rules["passengers["+i+"].phone"] = {
          requiredPhone: true
        };
      }
    }

    $("#form_booking").validate(validationRules);

    if (!$("#form_booking").valid()) {
      this.props.actionSetOrderVal('formMsg',
        'Please correct the fields above.'
      );
      return;
    }
    $("#bookingModal").modal({
      backdrop: 'static',
      keyboard: false
    });
    let savedData = JSON.parse(JSON.stringify(this.props));
    this.postOrder()
      .then(function (resData) {
        //FIXME jquery mess
        $("#bookingModal").modal('hide');
        if (!resData.error && resData.bookingId) {
          historyStrategy.push('/booking/' + resData.bookingId);
        } else if (resData.flashMsg) {
          savedData.orderData.flashMsg = resData.flashMsg;
          //scroll to page top to show error message after components re-render
          window.scrollTo(0, 0);
          this.props.loadSuccess(savedData.orderData);
        } else {
          this.props.loadFailed(resData);
        }
      }.bind(this))
      .catch(function (error) {
        console.error(error);
        //FIXME jquery mess
        $("#bookingModal").modal('hide');
      });
  },

  componentWillMount: function () {
    this.props.loadSuccess({});
  },

  componentDidMount: function() {
    this.getOrder()
      .then(function (resData) {
        resData.error ? this.props.loadFailed(resData) : this.props.loadSuccess(resData);
      }.bind(this))
      .catch(function (error) {
        console.error(error);
      });
  },

  render: function () {

    if (this.props.orderData.error) {
      return <DisplayAlert errorInfo={this.props.orderData.errorInfo}/>;
    }

    if (this.props.orderData.action == 'order') {
      if (!this.props.orderData.itineraryData) {
        console.error('Undefined itineraryData');
        return <DisplayAlert />;
      }

      let _passengers = [];
      for (let i = 1; i <= this.props.commonData.searchParams.passengers; i++) {
        _passengers.push(<PassengerItemContainer passengerData={this.makePassengerData(
          this.props.orderData.fieldsData,
          i
        )} index={i} orderData={this.props.orderData} key={'pass'+i}/>);
      }

      return (
        <span>
          <SearchBanner id="bookingModal" text="Booking your trip!"/>

        <form id="form_booking" className="booking">
          <div>

            <div className="confirmation persons-class-price">
              <div className="wrapper">
                <div className="people">{ this.props.commonData.searchParams.passengers }</div>
                <div className="class">{ ActionsStore.defineCabinClass(this.props.orderData.itineraryData) }</div>
                <div className="price">{this.props.orderData.itineraryData.orderPrice}</div>
              </div>
            </div>
            <div className="flight-unit">
              <div className="booking-flight-unit">
                <ResultItemContainer key={this.props.orderData.itineraryData.id} itinerary={this.props.orderData.itineraryData} showFullInfo={true}/>
              </div>
            </div>

            <div className={this.props.orderData.flashMsg ? "warning warning-booking" : ""} role="alert">{this.props.orderData.flashMsg}</div>

            <div className="form">

            <div className="page-ti billing">Billing</div>
            {this.makeOrderData(this.props.orderData).map(
              (item, index) => {
                let elem;
                if (item.id === "Country") {
                  elem = <OrderPanelElementCountry profileStructure={this.props.orderData.profileStructure} item={item}
                          key={index} elemNum={index} panelType="fields"/>;
                } else if (item.id === "State") {
                  elem = <OrderPanelElementState profileStructure={this.props.orderData.profileStructure} item={item}
                          key={index} elemNum={index} panelType="fields"/>;
                } else {
                  elem = <OrderPanelElement profileStructure={this.props.orderData.profileStructure} item={item}
                          key={index} elemNum={index} panelType="fields"/>
                }
                return elem;
              }
            )}

            <div className="page-ti people">Travellers</div>
            {_passengers}

            <div className="buttons">
              <div className={this.props.orderData.formMsg ? "error" : ""} role="alert">{this.props.orderData.formMsg}</div>
              <button id="booking_button" className="big-button" onClick={this.execReq}>
                {this.props.specialOrder ? 'Submit' : this.props.orderData.itineraryData.orderPrice}
              </button>
            </div>

            </div>{/* ends div.form */}
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
    commonData: store.commonData,
  };
};

const mapDispatchOrder = (dispatch) => {
  return {
    loadSuccess: (data) => {
      dispatch(actionLoadOrderSuccess(data))
    },
    loadFailed: (data) => {
      dispatch(actionLoadOrderFailed(data))
    },
    actionSetOrderVal: (fieldName, fieldValue) => {
      dispatch(actionSetOrderVal(fieldName, fieldValue))
    },
  }
};

let OrderPanelContainer = ReactRedux.connect(mapStateOrder, mapDispatchOrder)(OrderPanel);

export default OrderPanelContainer;
