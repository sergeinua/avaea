import React from 'react';

const FormElementCounter = React.createClass({
  getInitialState() {
    return {
      min: typeof(this.props.min) !== 'undefined' && typeof(this.props.min) !== 'boolean'
        ? parseInt(this.props.min) || 0 : false,
      max: typeof(this.props.max) !== 'undefined' && typeof(this.props.max) !== 'boolean'
        ? parseInt(this.props.max) || 0 : false,
      value: parseInt(this.props.value) || 0
    }
  },

  decCount(e) {
    let val = this.state.value + 0;
    if (this.state.min === false || this.state.value > this.state.min) {
      this.setState({value: --val});
    }
  },

  incCount(e) {
    let val = this.state.value + 0;
    if (this.state.max === false || this.state.value < this.state.max) {
      this.setState({value: ++val});
    }
  },

  disabledMin() {
    return (this.state.min !== false && this.state.value <= this.state.min);
  },

  disabledMax() {
    return (this.state.max !== false && this.state.value >= this.state.max);
  },

  disabledInput() {
    return this.disabledMin() && this.disabledMax();
  },

  handleChange(e) {
    let val = parseInt(e.target.value) || 0;
    if (((this.state.min === false || val >= this.state.min)) &&
    (this.state.max === false || val <= this.state.max)) {
      this.setState({value: val});
    }
    return false;
  },
  componentDidUpdate(prevProps, prevState) {
    if (prevState.value != this.state.value) {
      if (this.props.onChange && typeof(this.props.onChange) === 'function')
        this.props.onChange(this.state.value + 0);
    }
  },

  render() {
    return (
      <div className={["counter-wrap "] + this.props.className}>
        {this.props.label && this.props.label.length > 0 &&
          <div className="label-wrap">
            <div className="ti">{this.props.label}</div>
            {this.props.hint && this.props.hint.length > 0 &&
              <div className="hint">{this.props.hint}</div>
            }
          </div>
        }
        <div className="count holder">
          <div
            className={["subtract"] + [this.disabledMin() ? " disabled" : ""]}
            onClick={this.decCount}
          ><span>-</span></div>
          <input className={["counter"] + [this.disabledInput() ? "disabled" : ""]} value={this.state.value} onChange={this.handleChange} name={this.props.name} disabled={this.disabledInput() ? "disabled" : ""} />
          <div
            className={["add"] + [this.disabledMax() ? " disabled" : ""]}
            onClick={this.incCount}
          ><span>+</span></div>
        </div>
      </div>
    )
  }
});
export default FormElementCounter;
