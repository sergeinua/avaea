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
		    		 <span className="sub-ti"><span>Miles</span></span>
		    		 <span className="value">
		    		 	 <span className="icon-spinner"></span>
		    	   </span>
		    	 </div>
		    	 <div className="wrapper double program no-value">{/* animates IF there is a value */}</div>
		    	 <div className="wrapper double savings no-value">{/* animates IF there is a value */}</div>
		   </div>     
        
    } else if (miles.value > 0) {
      // successful result
      return <div className="holder">
    			<div className="wrapper double miles">
		        <span className="sub-ti"><span>Miles</span></span>
		        <span className="value"><span>{miles.value}</span></span>
	        </div>
	        <div className="wrapper double program">
		        <span className="sub-ti"><span>Program</span></span>
		        <span className="value">{miles.name}</span>
	        </div>
	        <div className="wrapper double savings">
		        <span className="sub-ti"><span>Estimated Value</span></span>
		        <span className="value">{ '$' + Math.round(miles.value *.02) }</span>
          </div>
	      </div>  
    }
    // 0 result or error
    return <div className="holder">
    			<div className="wrapper double miles none">
		    		<span className="sub-ti"><span>Miles</span></span>
		    		<span className="value">None</span>
		    	</div>
		    </div>
  },

  showRefundType: function (refundType) {
    $('input[name=refundType]').val(refundType);
    if (refundType === false) {
      return <span className="icon-spinner"></span>
    } else {
    	return <span className="value">{refundType}</span>
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
		      
		      <div className="benefit refundable single-story">
		      	<div className="wrapper double">
			        <span className="sub-ti"><span>Refund Type</span></span>
			        <span className="value">{this.showRefundType(this.props.refundType)}</span>
		        </div>
		      </div>{/* end refundable */}
		      
		    </div>{/* end benefits */}
		    
	    </span>
    )
  }
});

export default Citypairs;
