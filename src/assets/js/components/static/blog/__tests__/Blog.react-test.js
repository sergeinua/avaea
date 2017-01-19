import React from 'react';
import StaticBlog from '../Blog';
import renderer from 'react-test-renderer';

test('Blog component test', () => {
  var mockUser = {email: "test@gmail.com", id: 58};
  var component = renderer.create(
    <StaticBlog user={mockUser}/>
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();

});
