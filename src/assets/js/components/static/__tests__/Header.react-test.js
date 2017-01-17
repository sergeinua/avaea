import React from 'react';
import StaticHeader from '../Header';
import renderer from 'react-test-renderer';

test('Header component test', () => {
  var mockUser = {email: "test@gmail.com", id: 58};
  var mockLocation = {pathname: '/home'};
  var component = renderer.create(
    <StaticHeader user={mockUser} location={mockLocation}/>
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();

});
