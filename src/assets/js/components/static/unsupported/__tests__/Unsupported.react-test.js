import React from 'react';
import StaticUnsupported from '../Unsupported';
import renderer from 'react-test-renderer';


test('StaticUnsupported component test', () => {
  var mockUser = {email: "test@gmail.com", id: 58};
  var component = renderer.create(
    <StaticUnsupported user={mockUser} />
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();

});
