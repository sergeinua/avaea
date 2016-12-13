var StaticContact = React.createClass({
  render: function () {
    return (
      <div>
      	<div className="content static contact">
      		<div className="wrapper">
	      		<h1>Say Hello</h1>
	      		
	      		<div className="copy">
	      			We'd like to hear from you. Your feedback helps us improve our service. 
	      			Whether we made your travel booking experience an excellent one, or
	      			there's something we need to work on, your questions will receive a
	      			response.
	      		</div>
	      			
	      		<form className="contact">
	      			<div className="line-item">
	      				<div className="form-label required">
	      					Your name
	      				</div>
	      				<div className="form-field">
	      					<input name="name" />
	      				</div>
	      			</div>
	      			
	      			<div className="line-item">
	      				<div className="form-label">
	      					Your email address (required if you'd like a reply)
	      				</div>
	      				<div className="form-field">
	      					<input name="email" />
	      				</div>
	      			</div>
      			
	      			<div className="line-item">
		    				<div className="form-label required">
		    					Your comment
		    				</div>
		    				<div className="form-field">
		    					<textarea name="comment" />
		    				</div>
		    			</div>
		    			
		    			<div className="line-item">
		    			{/* --------- please integrate Google recaptcha here ----------- */} 
		    			</div>
	      			
	      			<a className="buttonly" href="#">Send</a>
	      		</form>
	      		
	      		<div className="success confirmation">
	      			Thank you! Your contact has been sent.
	      		</div>
	      		
	      	</div>{/* ends wrapper */} 
      	</div>{/* ends content */} 
      </div>
    )
  }
});
