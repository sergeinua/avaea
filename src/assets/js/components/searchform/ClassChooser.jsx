import React from 'react';
import { ActionsStore } from '../../functions.js';

var ClassChooser = React.createClass({
	
	changeClass: function(value) {
    return function () {
    	ActionsStore.setFormValue('CabinClass', value);
    }.bind(this);
  },


  render() {
    return (
    		<span>
    		
        <div id="economy" 
        		onClick={this.changeClass('E')} className={["choice "] + [this.props.searchParams.CabinClass == 'E' ? "active":""]}>
		 	 			Economy</div>
		 	 			
			 	<div id="premium" 
			 			onClick={this.changeClass('P')} className={["choice "] + [this.props.searchParams.CabinClass == 'P' ? "active":""]}>
				 		Premium</div>	
				 		
			 	<div id="business" 
			 			onClick={this.changeClass('B')} className={["choice "] + [this.props.searchParams.CabinClass == 'B' ? "active":""]}>
						Business</div> 	
						
				<div id="first" 
						onClick={this.changeClass('F')} className={["choice "] + [this.props.searchParams.CabinClass == 'F' ? "active":""]}>
						First Class</div>	
						
				</span>		
    )
  }
});

export default ClassChooser;
