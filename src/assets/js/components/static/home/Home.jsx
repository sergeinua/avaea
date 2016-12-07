var StaticHome = React.createClass({
  render: function () {
    return (
    		<div>
	    		<div className="content static home">
	
	    	  	<div className="home top level">
	    	  
		    	    <div className="video-holder">   
		    	      <video poster="../images/static/tarmac-placeholder.jpg" id="bgvid" playsInline autoPlay muted loop>
		    	        <source src="../images/static/Tarmac.mp4" type="video/mp4" />
		    	        <source src="../images/static/Tarmac.mp4" type="video/ogg" />
		    	      </video>
		    	      <div className="overlay"></div>
		    	    </div>   
	    	      
	    	    	<div className="home-top-copy">
			          <div className="slogan">
			          	<span className="slogan first">Best price.</span> 
			          	<span className="slogan second">Best choice.</span> 
			          	<span className="slogan third">Travel Intelligence for your journey.</span>
			          </div>
			    	    
			    	    <div className="try-it">
			    	    	<form>
			    	    		<div className="wrapper">
					    	    	<div className="ti">Where I want to go</div>
					    	    	<div className="loc-holder">
					    	    		<input type="text" /><span>to</span><input type="text" />
					    	    	</div>	
					    	      <div className="ti">When</div>
					    	    	<input type="text" />
				    	    	</div>
			    	    	  <a className="buttonly" href="#">Try it</a>
				    	    </form>
			    	    </div>{/* ends try-it form */} 
			    	    
			    	  </div> {/* ends home-top-copy */}
		    	  </div> {/* ends home top level */}
		    	  
		    	  
		    	  <div className="home second level">
			    	  <h1>It's time technology made booking travel easier.</h1>
			    	  <div className="static-features">
			    	  
			    	  	<div className="feature-voice">
			    	  		<h2>Talk to us</h2>
			    	  		<h3>when you're on the go</h3>
			    	  		<div className="graphic"></div>
			    	  		<div className="copy">
				    	  		<span>Book your travel using your voice instead of your thumbs. </span> 
				    	  		Walk, talk, and get your tickets. Our voice agent hears and 
				    	  		searches - you don’t need to touch the keyboard.
			    	  		</div>
				    	  </div>
				    	  
				    	  <div className="feature-ff">
			    	  		<h2>See FF Miles</h2>
			    	  		<h3>up front value</h3>
			    	  		<div className="graphic"></div>
			    	  		<div className="copy">
				    	  		<span>We show you what matters to you. </span> 
				    	  		Like how many Frequent Flyer miles each ticket awards. 
				    	  		And, we make it easy to weigh options like price and 
				    	  		duration against airlines, scheduling 
				    	  		and wireless availability. 
			    	  		</div>
				    	  </div>
				    	  
				    	  <div className="feature-price">
			    	  		<h2>Low Price</h2>
			    	  		<h3>try it out</h3>
			    	  		<div className="graphic"></div>
			    	  		<div className="copy">
				    	  		<span>Your wallet will love our prices. </span> 
				    	  		Your free time will love how much faster it is to 
				    	  		identify the ticket you wanted without 
				    	  		requiring a Ph.D in filtering. Booking is easy now.
			    	  		</div>
				    	  </div>
				    	  
				    	  
				    	</div>{/* ends features */}  
		    	  </div> {/* ends home second level */}
		    	  
		    	  <div className="home third level">
			  	  	<p>Here is home third level content.</p>
			  	  </div>
			  	
		    	  <div className="home bottom level">
		    	  	<p>Here is home bottom level content.</p>
		    	  </div>
		    	  
	    	</div> {/* ends content */}
	    	
	   </div> 	
    )
  }
});
