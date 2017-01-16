import React from 'react';
import StaticJobs from '../Jobs';
import renderer from 'react-test-renderer';


test('StaticJobs component test', () => {
  var mockUser = {email: "test@gmail.com", id: 58};
  var component = renderer.create(
    <StaticJobs user={mockUser} />
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();

});
