import React from 'react';
import Flight from './Flight.jsx';
import moment from 'moment';
{/* import MerchandisingInfo from './MerchandisingInfo.jsx'; */}

let Citypairs = React.createClass({

  showFMiles: function(miles) {
    if (miles === undefined || miles.isLoading) {
      // spinner here
      return <div className="holder">
      		<div className="wrapper miles no-value">
		    		 <span className="sub-ti">Miles</span>
		    		 <span className="count">
		    		 	 <span className="icon-spinner"></span>
		    	   </span>
		    	 </div>
		    	 <div className="wrapper program no-value">
		        <span className="sub-ti">Program</span>
		        <span className="program-name">
		        	<span className="icon-spinner"></span>
		        </span>
	        </div>
		   </div>     
        
    } else if (miles.value > 0) {
      // successful result
      return <div className="holder">
    			<div className="wrapper miles">
		        <span className="sub-ti">Miles</span>
		        <span className="count">
		        	{/* {miles.value} */}
		        	<span className="icon-spinner"></span>
		        </span>
	        </div>
	        <div className="wrapper program">
		        <span className="sub-ti">Program</span>
		        <span className="program-name">
			        {/* {miles.value} */}
		        	<span className="icon-spinner"></span>
		        </span>
	        </div>
	      </div>  
    }
    // 0 result or error
    return <div className="holder">
    			<div className="wrapper miles none">
		    		<span className="sub-ti">Miles</span>
		    		<span className="count">None</span>
		    	</div>
		    </div>
  },

  showRefundType: function (refundType) {
    $('input[name=refundType]').val(refundType);
    if (refundType === false) {
      return <span className="icon-spinner"></span>
    } else {
    	{/* return refundType; */}
    	return <span className="icon-spinner"></span>
    }
  },

  render: function() {
    return (
    	<span>	
    	
	      <div className="summary detail-itin">
		      <div className="holder">
		        {this.props.citypairs.map(function (pair, i) {
		            i++;
		            return  <div className={'section ' + [ pair.direction ]} key={i}> 
		
		              {/*
		              <div className="extras">
		                <MerchandisingInfo flights={pair.flights}/>
		              </div>
		              */}
		 
		            { pair.flights.map(function (flight, j) {
		              return <Flight  key={j} flight={flight} count={j} pair={pair}/>
		            })}
		            </div>
		          })}
		      </div>{/* end holder */}
	      </div>{/* end detail-itin */}
	      
	      <div className="summary benefits">
	      
	      	<div className="benefit ff-miles">
	      		<div className="ti">Frequent Flyer Miles</div>
	      		
		      	{this.showFMiles(this.props.miles)}
		      
		      </div>{/* end ff miles */}
		      
		      <div className="benefit refundable">
		        <span className="ti">Refund Type</span>
		        <span className="copy">{this.showRefundType(this.props.refundType)}</span>
		      </div>{/* end refundable */}
		      
		    </div>{/* end benefits */}
		    
	    </span>
    )
  }
});

export default Citypairs;
