import React from 'react';
import { render } from 'react-dom';

export default function StaticContainer(props) {
  return render(<div>
    <link rel="stylesheet" href="/static/styles.css"/>
    <StaticHeader user={InitData.user||{}}/>
    {props.children}
    <StaticFooter user={InitData.user||{}}/>
  </div>);
};
