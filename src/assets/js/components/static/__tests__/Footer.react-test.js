import React from 'react';
import StaticFooter from '../Footer';
import renderer from 'react-test-renderer';

test('Footer component test', () => {
  var mockUser = {email: "test@gmail.com", id: 58};
  var mockLocation = {pathname: '/home'};
  var component = renderer.create(
    <StaticFooter user={mockUser} location={mockLocation}/>
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();

});
