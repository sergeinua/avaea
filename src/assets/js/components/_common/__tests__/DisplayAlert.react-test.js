import React from 'react';
import DisplayAlert from '../DisplayAlert';
import renderer from 'react-test-renderer';
import Link from 'react';

test('DisplayAlert component test', () => {

  var component = renderer.create(
    <DisplayAlert />
  );

  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();

});
