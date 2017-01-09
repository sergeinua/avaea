import React from 'react';
import FormElementRadioContainer from '../FormElementRadio';
import renderer from 'react-test-renderer';

test('FormElementRadioContainer component test', () => {
  var mockProps = {
    elemNum: 3,
    panelType: "personal",
    item: {id: "personal_info.gender", type: "radio", title: "Gender", data: ""},
    profileStructure: {M: "Male", F: "Female"}
  };
  var component = renderer.create(
    <FormElementRadioContainer
      id={mockProps.item.id}
      panelType={mockProps.panelType}
      item={mockProps.item}
      profileStructure={mockProps.profileStructure[mockProps.item.id]}
      elemNum={mockProps.elemNum}
    />
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
