import React from 'react';
import StaticPartner from '../Partner';
import renderer from 'react-test-renderer';


test('StaticPartner component test', () => {
  var mockUser = {email: "test@gmail.com", id: 58};
  var component = renderer.create(
    <StaticPartner user={mockUser} />
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();

});
