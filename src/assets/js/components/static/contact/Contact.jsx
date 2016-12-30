import React from 'react';
import validator from 'validator';
import ReCAPTCHA from 'react-google-recaptcha';
import ClientApi from '../../_common/api.js';

var globalRecaptchaPublicKey = recaptchaPublicKey;
let StaticContact = React.createClass({
  getInitialState: function () {
    return {
      recaptcha: false,
      isRecaptchaErrorVisible: false,

      isFormSending: false,
      isFormSend: false,
      isFormSendError: false,
      formSendError: '',

      name: "",
      isNameErrorVisible: false,

      email: "",
      isEmailErrorVisible: false,

      comment: "",
      isCommentErrorVisible: false,
    }
  },
  handleNameChange: function (event) {
    this.setState({name: event.target.value});
  },
  handleEmailChange: function (event) {
    this.setState({email: event.target.value});
  },
  handleCommentChange: function (event) {
    this.setState({comment: event.target.value});
  },
  validateName: function () {
    this.setState({isNameErrorVisible: !this.isNameValid()});
  },
  validateEmail: function () {
    this.setState({isEmailErrorVisible: !this.isEmailValid()});
  },
  validateComment: function () {
    this.setState({isCommentErrorVisible: !this.isCommentValid()});
  },
  validateRecaptcha: function () {
    this.setState({isRecaptchaErrorVisible: !this.isRecaptchaValid()});
  },
  validateForm: function () {
    this.validateName();
    this.validateEmail();
    this.validateComment();
    this.validateRecaptcha();
  },
  handleNameBlur: function () {
    this.validateName();
  },
  handleEmailBlur: function () {
    this.validateEmail()
  },
  handleCommentBlur: function () {
    this.validateComment();
  },
  isNameValid: function () {
    return this.state.name.trim().length >= 3;
  },

  isEmailValid: function () {
    return this.state.email.trim().length == 0 || validator.isEmail(this.state.email);
  },

  isCommentValid: function () {
    return this.state.comment.trim().length >= 3;
  },

  isRecaptchaValid: function () {
    return !!this.state.recaptcha;
  },
  isFormValid: function () {
    return this.isNameValid() && this.isEmailValid() && this.isCommentValid() && this.isRecaptchaValid();
  },
  handleSubmit: function (event) {
    event.preventDefault();
    if (this.isFormValid()) {
      this.setState({isFormSending: true});
      this.send();
    } else {
      this.validateForm();
    }
  },

  onRecaptchaChange: function (value) {
    this.setState({recaptcha: value});
  },

  send: function () {
    return ClientApi.reqPost('/feedback/verify', {
      recaptcha: this.state.recaptcha,
      name: this.state.name,
      email: this.state.email,
      comment: this.state.comment
    })
      .then(function (resp) {
        var responseObject = typeof resp === "object" ? resp: JSON.parse(resp);
        if (responseObject.error) {
          this.setState({
            isFormSending: false,
            isFormSend: false,
            isFormSendError: true,
            formSendError: responseObject.errorMsg
          });
        } else {
          this.setState({
            isFormSending: false,
            isFormSend: true
          });
        }
      }.bind(this))

      .catch(function (err) {
        this.setState({
          isFormSending: false,
          isFormSend: false,
          isFormSendError: true,
          formSendError: err
        });
      }.bind(this));

  },

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

            { !this.state.isFormSend ?
              <form className="contact">
                <div className={"line-item" + (this.state.isNameErrorVisible ? " error" : "")}>
                  <div className="form-label required">
                    Your name
                  </div>
                  {
                    this.state.isNameErrorVisible ?
                      <div className="error-msg">
                        This field must have at least 3 characters.
                      </div>
                      : null
                  }
                  <div className="form-field">
                    <input type="text"
                           value={this.state.name}
                           onChange={this.handleNameChange}
                           onBlur={this.handleNameBlur}/>
                  </div>
                </div>

                <div className={"line-item" + (this.state.isEmailErrorVisible ? " error" : "")}>
                  <div className="form-label">
                    Your email address (required if you'd like a reply)
                  </div>
                  {
                    this.state.isEmailErrorVisible ?
                      <div className="error-msg">
                        This does not seem to be a valid email address.
                      </div> : null
                  }
                  <div className="form-field">
                    <input type="text"
                           value={this.state.email}
                           onChange={this.handleEmailChange}
                           onBlur={this.handleEmailBlur}/>
                  </div>
                </div>

                <div className={"line-item" + (this.state.isCommentErrorVisible ? " error" : "")}>
                  <div className="form-label required">
                    Your comment
                  </div>
                  {
                    this.state.isCommentErrorVisible ?
                      <div className="error-msg">
                        This field must have at least 3 characters.
                      </div> : null
                  }
                  <div className="form-field">
                    <textarea type="text"
                              value={this.state.comment}
                              onChange={this.handleCommentChange}
                              onBlur={this.handleCommentBlur}/>
                  </div>
                </div>

                <div className={"line-item" + (this.state.isRecaptchaErrorVisible ? " error" : "")}>
                  {
                    this.state.isRecaptchaErrorVisible ?
                      <div className="error-msg">
                        This field is required
                      </div> : null
                  }

                  <ReCAPTCHA
                    ref="recaptcha"
                    sitekey={globalRecaptchaPublicKey}
                    onChange={this.onRecaptchaChange}
                  />
                </div>

                {
                  (!this.state.isFormSending && this.state.isFormSendError) ?
                  <div className="line-item error">
                    <div className="error-msg">
                      {this.state.formSendError}
                    </div>
                  </div>: null
                }

                <a className={"buttonly" + (this.state.isFormSending ? " sending" : "")}
                   href="#"
                   onClick={this.handleSubmit}>Send</a>
              </form> : null
            }

            { this.state.isFormSend ?
              <div className="success confirmation">
                Thank you! Your contact has been sent.
              </div> : null
            }

          </div>
          {/* ends wrapper */}
        </div>
        {/* ends content */}

      </div>
    )
  }
});

export default StaticContact;
