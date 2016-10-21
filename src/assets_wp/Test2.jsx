// import {ExampleSuggest2} from 'react-bootstrap-typeahead';

var ExampleSuggest = require('react-bootstrap-typeahead').default;
import {render} from 'react-dom';

var myData = [
  'John',
  'Miles',
  'Charles',
  'Herbie',
];
function logChange(val) {
  console.log("Selected: " + val.toSource());
}


render(
  (<ExampleSuggest
      labelKey="name"
      onChange={logChange}
      options={myData} />
  ), document.getElementById('test123'));