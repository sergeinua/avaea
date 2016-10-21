var ExampleSuggest = require('react-select');
import ReactDOM from 'react-dom';

var options = [
  { value: 'one', label: 'One' },
  { value: 'two', label: 'Two' },
  { value: 'thre', label: 'Three' },
];

function logChange(val) {
  console.log("Selected: " + val.toSource());
}

ReactDOM.render(<ExampleSuggest name="form-field-name" value="one" options={options} onChange={logChange}/>, document.getElementById('test123'));