import React from 'react';
import StaticHeader from '~/static/Header.jsx';
import StaticFooter from '~/static/Footer.jsx';

export default function StaticContainer(props) {
  return (<div>
    <link rel="stylesheet" href="/static/static.css"/>
    <StaticHeader {...props} user={InitData.user||{}}/>
    {props.children}
    <StaticFooter {...props} user={InitData.user||{}}/>
  </div>);
};

// require('../../static/static.css');
