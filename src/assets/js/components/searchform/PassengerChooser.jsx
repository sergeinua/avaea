import React from 'react';
import { ActionsStore } from '../../functions.js';

var PassengerChooser = React.createClass({

  componentWillMount: function () {
    this.updateCount(this.props.searchParams.passengers);
  },

  changePassengersCount: function() {
    this.updateCount(parseInt(this.props.searchParams.passengers) + 1);
  },

  updateCount: function(passengerVal) {
    if (!passengerVal || passengerVal > 4) {
      passengerVal = 1;
    }
    ActionsStore.setFormValue('passengers', passengerVal);
  },

  var passengers_text = this.props.searchParams.passengers == 1 ? "Adult" : "Adults";

    return (
    		
    		<span>
    		
    		
    		
    		
    		</span>
         
 
    )
  }
});

export default PassengerChooser;
