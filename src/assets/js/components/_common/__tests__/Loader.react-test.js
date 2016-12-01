import React from 'react';
import Loader from '../Loader';
import renderer from 'react-test-renderer';

test('Loader component test', () => {

  var component = renderer.create(
    <Loader />
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();

});
