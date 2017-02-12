import React from 'react';
import * as ReactRedux from 'react-redux';
import { actionSetCommonVal } from '../../actions.js';
import { unfocusFormForIos, ActionsStore, getDefaultDateSearch } from '../../functions.js';
import TripSearchForm from '../searchform/TripSearchForm.jsx';
import ClassChooser from '../searchform/ClassChooser.jsx'; 
import PassengerChooser from '../searchform/PassengerChooser.jsx'; 
import Calendar from '../searchform/Calendar.jsx';
import MultiCityForm from '../searchform/MultiCityForm.jsx';
import VoiceForm from '../searchform/VoiceForm.jsx';
import Typeahead from '../searchform/Typeahead.jsx';


var SearchFormPage = React.createClass({
	
	componentDidMount: function () {
		
		// FIXME - convert to React, opens and closes trip-type, class and passenger menu
		
		// on click menu button, prevent other dropmenus from staying open, but toggle the menu controlled by the button
		$('.dropbutton')
			.click(function () {
      if ($('.dropbutton').not(this).next('.dropmenu').not('.hide')) {
      	$('.dropbutton').not(this).next('.dropmenu').addClass('hide');
      	$(this).next('.dropmenu').toggleClass('hide');	
      }
    });
  	
		// close the open dropmenu on selection of a choice (but not passenger chooser, since it requires multiple touches)
		$('.dropmenu:not(.passenger-chooser)') 
	    .click(function () {
	    if (!$(this).hasClass('hide')) {
	    	$(this).addClass('hide');
	    }
	  });
	},

  componentWillMount: function () {
    analytics.page(this.props.location.pathname);
    
    // FIXME - convert to React after removing jquery modal
    $('.modal-backdrop').remove();
    $('body').removeClass('modal-open');
    
    // FIXME - convert to React, controls when logo should show in navbar
    $('body').removeClass('suppress-logo');
    
    actionSetCommonVal('searchParams', getDefaultDateSearch(this.props.commonData.searchParams));
    ActionsStore.changeForm(this.props.commonData.searchParams.flightType);
  },
  
  // this is used in a couple of places, should it be global?
  flightTypeName: {
    round_trip: 'Round trip',
    one_way: 'One way',
    multi_city: 'Multi-City',
  },
  
  changeForm: function(form) {
    return function () {
      ActionsStore.changeForm(form);
    }.bind(this);
  },
  
  
  
  render: function() {
    return (
      <div>
        { this.props.commonData.currentForm != 'voice_search' && this.props.commonData.currentForm != 'calendar'  && this.props.commonData.currentForm != 'airport-search' ?
        <div className="searchnav" >
	        <div className="positioner">
	        
	        	<div className="wrapper trip-type">
	          	<div id="dropbuttonTripType" className="dropbutton">{ this.flightTypeName[this.props.commonData.searchParams.flightType] }</div>
	          	<div className="dropmenu pretty hide">		
		            <div id="one_way"
		                 className={["choice "] + [this.props.commonData.currentForm == 'one_way' ? "active":""]}
		                 onClick={this.changeForm('one_way')}>One Way</div>
		            <div id="round_trip"
		                 className={["choice "] + [this.props.commonData.currentForm == 'round_trip' ? "active":""]}
		                 onClick={this.changeForm('round_trip')}>Round Trip</div>
		            <div id="multi_city"
		                 className={["choice "] + [this.props.commonData.currentForm == 'multi_city' ? "active":""]}
		                 onClick={this.changeForm('multi_city')}>Multi-City</div>
			         </div>{/* ends dropmenu */}        
		         </div>{/* ends trip-type */} 
		         
		         <div className="wrapper seat-class">
	         	 	<div id="dropButtonSeatClass" className="dropbutton">{  serviceClass[this.props.commonData.searchParams.CabinClass] }</div>
		         	 <div className="dropmenu pretty hide">	
		         	 <ClassChooser searchParams={this.props.commonData.searchParams}/>
			         </div>{/* ends dropmenu */} 
				     </div>{/* ends seat-class */}
		           
	           <div className="wrapper passengers">
	           		{/* engineer - implement logic to display correct wording where "Adult" is */}
	         			<div id="dropButtonPassengers" className="dropbutton">{ this.props.commonData.searchParams.passengers } Adult</div>
		          	<div id="passenger-chooser" className="dropmenu pretty passenger-chooser robust hide">	
				        	<PassengerChooser searchParams={this.props.commonData.searchParams}/>
				        </div>{/* ends dropmenu */} 
		         </div>{/* ends passengers */}
	           
	          </div>{/* ends positioner */}         
	        
        </div>:null
        }
        
        { this.props.commonData.currentForm == 'multi_city' ?
          <MultiCityForm />
          : null
        }
        { this.props.commonData.currentForm == 'one_way' || this.props.commonData.currentForm == 'round_trip' ?
          <TripSearchForm InitSearchFormData={this.props.commonData} />
          : null
        }
        { this.props.commonData.currentForm == 'voice_search' ?
          <VoiceForm />
          : null
        }
        { this.props.commonData.currentForm == 'calendar' ?
          <Calendar searchParams={this.props.commonData.searchParams}/>
          : null
        }
        { this.props.commonData.currentForm == 'airport-search' ?
          <Typeahead target={this.props.commonData.airportChoiceTarget} searchParams={this.props.commonData.searchParams}/>
          : null
        }
      </div>
    )
  }
});

const mapStateCommon = function(store) {
  return {
    commonData: store.commonData,
  };
};

const mapDispatchCommon = (dispatch) => {
  return {
    actionSetCommonVal: (fieldName, fieldValue) => {
      return dispatch(actionSetCommonVal(fieldName, fieldValue));
    },
  }
};

const SearchFormPageContainer = ReactRedux.connect(mapStateCommon, mapDispatchCommon)(SearchFormPage);

export default SearchFormPageContainer;
