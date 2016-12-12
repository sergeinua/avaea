import React from 'react';
import UserProfilePanelElement from './UserProfilePanelElement.jsx';
import UserProfilePanelBlock from './UserProfilePanelBlock.jsx';

let UserProfilePanel = React.createClass({

  render: function() {
    var self = this, _panel = [];

    if (this.props.type == 'personal') {

      this.props.data.map(function (item, index) {
        _panel.push(<UserProfilePanelElement profileStructure={self.props.profileStructure} item={item} key={index} elemNum={index} panelType="personal"/>);
      });

    } else if (this.props.type == 'programs') {

      this.props.data.map(function (item, index) {
        _panel.push(<UserProfilePanelBlock programsStructure={self.props.programsStructure} item={item} key={index} blockNum={index}/>);
      });

    }

    return <div className="panel panel-default">
      <div className="panel-heading" role="tab" id="headingOne">
        <h4 className="panel-title">
          <a role="button" data-toggle="collapse" data-parent="#accordion" href={"#collapse" + this.props.id} aria-expanded="true" aria-controls={"collapse" + this.props.id}>
            {this.props.name}
          </a>
        </h4>
      </div>

      <div id={"collapse" + this.props.id} className="panel-collapse collapse in" role="tabpanel" aria-labelledby="headingOne">
        <div className="panel-body">
          { _panel }
        </div>
      </div>

    </div>
  }
});

export default UserProfilePanel;
