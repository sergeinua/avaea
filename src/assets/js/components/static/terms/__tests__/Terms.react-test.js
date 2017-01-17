import React from 'react';
import StaticTerms from '../Terms';
import renderer from 'react-test-renderer';


test('StaticTerms component test', () => {
  var mockUser = {email: "test@gmail.com", id: 58};
  var component = renderer.create(
    <StaticTerms user={mockUser} />
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();

});
