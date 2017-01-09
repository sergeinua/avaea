import React from 'react';
import StaticContact from '../Contact';
import renderer from 'react-test-renderer';

test('Contact component test', () => {
  var recaptchaPublicKey = 'mockqw4rq34q343';
  var mockUser = {email: "test@gmail.com", id: 58};
  var component = renderer.create(
    <StaticContact user={mockUser}/>
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();

});
