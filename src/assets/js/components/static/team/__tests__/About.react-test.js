import React from 'react';
import StaticAbout from '../About';
import renderer from 'react-test-renderer';

test('About component test', () => {
  var mockUser = {email: "test@gmail.com", id: 58};
  var component = renderer.create(
    <StaticAbout user={mockUser}/>
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();

});
