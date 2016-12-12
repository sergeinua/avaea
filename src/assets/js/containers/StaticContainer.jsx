import React from 'react';
// import { render } from 'react-dom';
import StaticHeader from '../components/static/Header.jsx';
import StaticFooter from '../components/static/Footer.jsx';

export default function StaticContainer(props) {
  return (<div>
    <link rel="stylesheet" href="/static/styles.css"/>
    <StaticHeader {...props} user={InitData.user||{}}/>
    {props.children}
    <StaticFooter {...props} user={InitData.user||{}}/>
  </div>);
};

// require('../../static/static.css');
