import React from 'react';
import * as ReactRedux from 'react-redux';
import OrderPanelElement from './OrderPanelElement.jsx';

let PassengerItem = React.createClass({
  render() {
    return (
      <div>
        <div className="which-passenger">Passenger {this.props.index}</div>

        {this.props.index == 1 ?
        <div className="its-me">
          <div className="tertiary-button">It's me</div>
          <div className="hint">Tap if traveller is the person being billed</div>
        </div>:null}

        {this.props.passengerData.map(
          (item, index) => <OrderPanelElement profileStructure={this.props.orderData.profileStructure} item={item} key={'elem-' + index} panelType="fields"/>
        )}
      </div>
    )
  }

});

const mapStateOrder = function(store) {
  return {
    orderData: store.orderData
  };
};

const PassengerItemContainer = ReactRedux.connect(mapStateOrder)(PassengerItem);

export default PassengerItemContainer;
