import React from 'react';
import NavBarContainer from '../components/_common/NavBar.jsx'

export default function AppContainer(props) {
  return (<div>
    <NavBarContainer {...props} />
    {props.children}
  </div>);
};

