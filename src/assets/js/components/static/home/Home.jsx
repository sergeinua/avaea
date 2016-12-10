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
			    	  <h1>Finally, tech that makes travel easier.</h1>
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
			  	  	<h1>And, this is only Beta. See what's next!</h1>
			  	  	
			  	  	<div className="copy">
			  	  		Today, we’re focused on air travel.  Tomorrow we’ll tackle 
			  	  		hotels, rental cars, Uber, Airbnb… the entire world of 
			  	  		travel. Here are features we’re developing now.
			  	  	</div>
			  	  		
			  	  	<div className="wrapper">
			  	  	
			  	  		<div className="upcoming">
			  	  			<div className="ti">Agent experience</div>
			  	  			<div className="copy">
			  	  				Your travel preferences remembered and calculated, 
			  	  				so you see the tickets you’ll love first.
			  	  			</div>
			  	  		</div>
			  	  		
			  	  		<div className="upcoming">
			  	  			<div className="ti">Full voice experience</div>
			  	  			<div className="copy">
			  	  				Never touch your keyboard. Book easily on the go, 
			  	  				while you walk to lunch or wait for the elevator.
			  	  			</div>
			  	  		</div>
			  	  		
			  	  		<div className="upcoming">
			  	  			<div className="ti">Refundable tickets</div>
			  	  			<div className="copy">
			  	  				Visibility into refunds and penalties.
			  	  			</div>
			  	  		</div>
			  	  		
			  	  		<div className="upcoming">
			  	  			<div className="ti">Watch ticket price</div>
			  	  			<div className="copy">
				  	  			Choose your price. If your chosen ticket meets 
				  	  			your price, it’s bought.
			  	  			</div>
			  	  		</div>
			  	  		
			  	  		<div className="upcoming">
			  	  			<div className="ti">Customized settings</div>
			  	  			<div className="copy">
			  	  				You know you best. Tell us what you like and we’ll search for that.
			  	  			</div>
			  	  		</div>
			  	  		
			  	  		<div className="upcoming">
			  	  			<div className="ti">Your travel history</div>
			  	  			<div className="copy">
				  	  			See all of your itineraries and easily re-book repeat trips 
				  	  			with the tickets that worked best for you.
			  	  			</div>
			  	  		</div>
			  	  		
			  	  		<div className="upcoming">
			  	  			<div className="ti">Notifications</div>
			  	  			<div className="copy">
			  	  				Set how you want to receive updates for booked travel. Add 
			  	  				other people who you want to receive notifications.
			  	  			</div>
			  	  		</div>
			  	  		
			  	  		<div className="upcoming">
			  	  			<div className="ti">Hotels, Cars and more</div>
			  	  			<div className="copy">
			  	  				Leverage our agent to provide full travel support.
			  	  			</div>
			  	  		</div>
			  	  		
			  	  		<div className="upcoming">
			  	  			<div className="ti">Smart Watch integration</div>
			  	  			<div className="copy">
				  	  			Tell it to the hand. Your watch can book your travel 
				  	  			and notify you of updates anywhere you go.
			  	  			</div>
			  	  		</div>
		    	  	
			  	  	</div> {/* ends wrapper */}
			  	  </div> {/* ends home third level */}
		    	  
	    	</div> {/* ends content */}
	    	<div className="home graphic"></div>
	    	
	   </div> 	
    )
  }
});
