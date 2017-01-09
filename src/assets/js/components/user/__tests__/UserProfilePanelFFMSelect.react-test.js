// jest.dontMock('../../../../../node_modules/react-input-autosize/lib/AutosizeInput.js');

import React from 'react';
import UserProfilePanelFFMSelect from '../UserProfilePanelFFMSelect';
import renderer from 'react-test-renderer';

test('UserProfilePanelFFMSelect component test', () => {

  var mockProps = {
    blockNum: 0
  };
  var index = 0;
  var item = {
    "id": "miles_programs",
    "title": "Airlines Frequent Flier Miles Programs",
    "data": [{
      "program_name": "UMP",
      "account_number": "VE234844",
      "tier": "24",
      "status": "2"}
    ]
  };
  var component = renderer.create(
    <UserProfilePanelFFMSelect
      elem_name={"miles_programs.program_name["+index+"]"}
      id={"miles_programs.airline_name-" + index}
      elem_value={item.program_name}
      blockNum={mockProps.blockNum}
      elemNum={index}
      elem_value_status={item.status}
      elem_value_tier={item.tier}
    />
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();

});
