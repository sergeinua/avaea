import React from 'react';
import NavBarContainer from '../components/_common/NavBar.jsx'

export default function AppContainer(props) {
  return (<div>
    <NavBarContainer {...props} />
    {props.children}
  </div>);
};

require('../../styles/1-reset.css');
require('../../styles/2-fonts.css');
require('../../styles/3-icons.css');
require('../../styles/4-2-bootstrap.css');
require('../../styles/4-4-scott.css');
require('../../styles/core.css');
require('../../styles/for-integration.css');
require('../../styles/loader.css');
require('../../styles/react-select.css');
