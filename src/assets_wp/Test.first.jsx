
import React from 'react';
import ReactDOM from 'react-dom';

export default class Hello extends React.Component {
  render() {
    return <h1>Hello kuku 789</h1>
  }
}

ReactDOM.render(<Hello/>, document.getElementById('hello'));