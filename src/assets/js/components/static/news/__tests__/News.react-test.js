import React from 'react';
import StaticNews from '../News';
import renderer from 'react-test-renderer';


test('StaticNews component test', () => {
  var mockUser = {email: "test@gmail.com", id: 58};
  var component = renderer.create(
    <StaticNews user={mockUser} />
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();

});
