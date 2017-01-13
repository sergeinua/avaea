import React from 'react';
import { browserHistory } from 'react-router';

let LoginModal = React.createClass({
  componentDidMount: function () {
     
  },

  render: function () {

    return (
    		<div className="modal login-modal" id="user-login-modal" role="dialog">
	        <div className="modal-dialog">
	          <div className="modal-content">
	          
		          <div className="title-bar">
			          <div className="close-x"></div>
			          <div className="title">Please Sign In</div>
		          </div>
	          
	            <div className="modal-body">
	
		              <div className="login-holder">
		              
			              <a href="/auth/facebook" className="big-button facebook" role="button">Facebook</a>
			            
			              <a href="/auth/google" className="big-button google" role="button">Google</a>
		          
		              </div>
	              
	            </div>
	          </div>
	        </div>
	      </div>
    );
  }

});

export default LoginModal;





