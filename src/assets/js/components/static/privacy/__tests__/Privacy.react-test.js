import React from 'react';
import StaticPrivacy from '../Privacy';
import renderer from 'react-test-renderer';


test('StaticPrivacy component test', () => {
  var mockUser = {email: "test@gmail.com", id: 58};
  var component = renderer.create(
    <StaticPrivacy user={mockUser} />
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();

});
