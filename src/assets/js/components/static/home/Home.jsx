var StaticHome = React.createClass({
  render: function () {
    return (
    		<div>
	    		<div className="content static home">
	
	    	  	<div className="home level top">
	    	  
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
			    	    
		    	  </div> {/* ends home level top */}
		    	  
		    	  <div className="home level second">
			  	  	<p>Here is home second level content.</p>
			  	  </div>
		    	  
		    	  <div className="home level third">
			  	  	<p>Here is home third level content.</p>
			  	  </div>
			  	
		    	  <div className="home level bottom">
		    	  	<p>Here is home bottom level content.</p>
		    	  </div>
		    	  
	    	</div> {/* ends content */}
	    	
	   </div> 	
    )
  }
});
