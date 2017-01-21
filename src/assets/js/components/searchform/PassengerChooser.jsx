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

  render: function () {
    var digits = {1:"One", 2:"Two", 3:"Three", 4:"Four"};
    var passengers_text = this.props.searchParams.passengers == 1 ? "Adult" : "Adults";

    return (
      <span>
      
      	<div id="passenger-chooser-close" className="close-x" onClick={() => {$("#passenger-chooser").addClass("hide");return false;}}></div>
      	
      	<div className="wrapper">
      	
      		<div className="passenger-type">
      			<div className="label-wrap">
      				<div className="ti">Adult</div>
      				<div className="age">12-64</div>
      			</div>
      			
      			<div className="count holder">
      				<div className="subtract disabled"><span>-</span></div>
      				<input className="counter" value="1" />
      				<div className="add"><span>+</span></div>
      			</div>
      		</div>{/* ends passenger type */}
      		
      		<div className="passenger-type">
    			<div className="label-wrap">
    				<div className="ti">Senior</div>
    				<div className="age">65+</div>
    			</div>
    			
    			<div className="count holder">
    				<div className="subtract disabled"><span>-</span></div>
    				<input className="counter" value="0" />
    				<div className="add"><span>+</span></div>
    			</div>
    		</div>{/* ends passenger type */}
    		
    		<div className="passenger-type">
	  			<div className="label-wrap">
	  				<div className="ti">Child</div>
	  				<div className="age">2-11</div>
	  			</div>
	  			
	  			<div className="count holder">
	  				<div className="subtract disabled"><span>-</span></div>
	  				<input className="counter" value="0" />
	  				<div className="add"><span>+</span></div>
	  			</div>
	  		</div>{/* ends passenger type */}
  		
				<div className="passenger-type">
					<div className="label-wrap">
						<div className="ti">Seat Infant</div>
						<div className="age">under 2</div>
					</div>
					
					<div className="count holder">
						<div className="subtract disabled"><span>-</span></div>
						<input className="counter" value="0" />
						<div className="add"><span>+</span></div>
					</div>
				</div>{/* ends passenger type */}
				
				<div className="passenger-type">
					<div className="label-wrap">
						<div className="ti">Lap Infant</div>
						<div className="age">under 2</div>
					</div>
					
					<div className="count holder">
						<div className="subtract disabled"><span>-</span></div>
						<input className="counter" value="0" />
						<div className="add"><span>+</span></div>
					</div>
				</div>{/* ends passenger type */}
      	
      	</div>{/* ends wrapper */}
      	
      	<div className="buttons double">
      		<button id="passenger-chooser-cancel-button" type="submit" className="big-button cancel-button" onClick={() => {$("#passenger-chooser").addClass("hide");return false;}}>Cancel</button>
      		<button id="passenger-chooser-done-button" type="submit" className="big-button">Done</button>
      	</div>
      	
      </span>
    )
  }
});

export default PassengerChooser;
