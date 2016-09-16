var UserProfile = React.createClass({

  profileData: {
    personal: [],
    programs: []
  },

  profileStructure: null,
  programsStructure: null,

  componentWillMount: function() {
    this.profileData.personal = [
      {id:'first_name', required: true, title: 'First Name', data: this.props.profileData.personal_info.first_name},
      {id:'middle_name', title: 'Middle Name', data: this.props.profileData.personal_info.middle_name},
      {id:'last_name', required: true, title: 'Last Name', data: this.props.profileData.personal_info.last_name},
      {id:'gender', title: 'Gender', data: this.props.profileData.personal_info.gender},
      {id:'birthday', type: "date", title: 'Birthday', placeholder: 'YYYY-MM-DD', data: this.props.profileData.personal_info.birthday},
      {id:'pax_type', title: 'Passenger Type', data: this.props.profileData.personal_info.pax_type},
      {id:'street', title: 'Address', data: this.props.profileData.personal_info.address.street},
      {id:'city', title: 'City', data: this.props.profileData.personal_info.address.city},
      {id:'state', title: 'State', data: this.props.profileData.personal_info.address.state},
      {id:'zip_code', title: 'Zip Code', data: this.props.profileData.personal_info.address.zip_code},
      {id:'country_code', title: 'Country Code', data: this.props.profileData.personal_info.address.country_code},
      {id:'notify_contact.name', title: 'In Case of Emergency Notify', placeholder: 'First and Last Name', data: this.props.profileData.notify_contact.name},
      {id:'notify_contact.phone', title: 'Emergency Notify Phone', placeholder: 'Phone number', data: this.props.profileData.notify_contact.phone}
    ];

    this.profileData.programs = [
      {id:'preferred_airlines', title: 'Preferred Airlines', data: this.props.profileData.preferred_airlines},
      {id:'miles_programs', title: 'Airlines Frequent Flier Miles Programs', data: this.props.profileData.miles_programs},
      {id:'lounge_membership', title: 'Airline Club Lounge Memberships', data: this.props.profileData.lounge_membership}
    ];

    this.profileStructure = this.props.profileStructure;

    this.programsStructure = {

      preferred_airlines:[
        {id: 'travel_type', title: 'Preferred Airlines type'},
        {id: 'airline_name', title: 'Airline Name'}
      ],
        miles_programs: [
        {id: 'airline_name', title: 'Airline Name'},
        {id: 'account_number', title: 'Account Number'},
        {id: 'flier_miles', title: 'Frequent Flier Miles'},
        {id: 'expiration_date', title: 'Expiration Date'}
      ],
      lounge_membership: [
        {id: 'airline_name', title: 'Airline Name'},
        {id: 'membership_number', title: 'Club Membership Number'},
        {id: 'expiration_date', title: 'Expiration Date'}
      ]
    };

    this.programsStructure = $.extend(true, this.programsStructure, this.props.programsStructure);

  },

  render: function () {
    return <div>
        <UserProfilePanel type="personal" profileStructure={this.profileStructure} data={this.profileData.personal} id="One1" name="Personal information" key="One" />
        <UserProfilePanel type="programs" programsStructure={this.programsStructure} data={this.profileData.programs} id="Two2" name="Airlines/Programs" key="Two" />
      </div>;
  }

});

var UserProfilePanel = React.createClass({

  render: function() {
    var self = this, _panel = [];

    if (this.props.type == 'personal') {

      this.props.data.map(function (item, index) {
        _panel.push(<UserProfilePanelElement profileStructure={self.props.profileStructure} item={item} key={index}/>);
      });

    } else if (this.props.type == 'programs') {

      this.props.data.map(function (item, index) {
        _panel.push(<UserProfilePanelBlock programsStructure={self.props.programsStructure} item={item} key={index}/>);
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



var UserProfilePanelElement = React.createClass({

  render: function() {

    if (this.props.profileStructure && this.props.profileStructure[this.props.item.id]) {

      if ($.isArray(this.props.profileStructure[this.props.item.id]) || $.isPlainObject(this.props.profileStructure[this.props.item.id])) {

        return <div>
            <label className={this.props.item.required ? "required" : ""}>{this.props.item.title}</label>
            <UserProfilePanelElementDropdown item={this.props.item } profileStructure={this.props.profileStructure[this.props.item.id]}/>
          </div>
      }

    } else {

      return <div>
        <label className={this.props.item.required ? "required" : ""}>{this.props.item.title}</label>
        <input type={this.props.item.type ? this.props.item.type : "text"} name={this.props.item.id} className="form-control input-sm"
               placeholder={this.props.item.placeholder ? this.props.item.placeholder : this.props.item.title} defaultValue={this.props.item.data} required/>
      </div>;

    }
  }

});

var UserProfilePanelElementDropdown = React.createClass({

  render: function () {
    var self = this,
      _nodes = [], _options = [], _selected;

    if ($.isArray(this.props.profileStructure)) {

      this.props.profileStructure.forEach(function(key) {
        _options.push({key: key, data: key});
      })

    } else {

      var _keys = Object.keys(this.props.profileStructure);
      _keys.forEach(function(key) {
        _options.push({key: key, data: self.props.profileStructure[key]});
      })

    }

    _options.map(function(option, index) {
        _nodes.push(<option key={index} value={option.key}>{option.data}</option>);
    });

    return <select name={this.props.item.id} className="form-control input-sm" defaultValue={self.props.item.data}>
      <option value="">---</option>
      { _nodes }
    </select>

  }

});



var UserProfilePanelBlock = React.createClass({

  render: function() {

    if (this.props.item.id == 'preferred_airlines') {

      return <UserProfilePanelBlockAirlines item={this.props.item} programsStructure={this.props.programsStructure}/>;

    } else if (this.props.item.id == 'miles_programs') {

      return <UserProfilePanelBlockPrograms item={this.props.item} programsStructure={this.props.programsStructure}/>;

    } else if (this.props.item.id == 'lounge_membership') {

      return <UserProfilePanelBlockMembership item={this.props.item} programsStructure={this.props.programsStructure}/>;

    } else {

      return null;

    }

  }

});

var UserProfilePanelBlockAirlines = React.createClass({

  render: function() {
    return <fieldset style={{backgroundImage: "linear-gradient(0, #f7f7ee, #FFFFFF)"}} key={1}>
      <legend style={{marginBottom: "0px", fontSize: "18px"}}>Preferred Airlines</legend>
      <div className="panel-body">
        <div id="preferredAirlines" fieldset-number="0">
          <hr className="hidden" />
          <label>Preferred Airlines type</label>

          <select name="preferred_airlines.travel_type[]" className="form-control input-sm" defaultValue="International Flights">
            <option defaultValue="" >please choose</option>
            <option defaultValue="Domestic Short Haul Trips">Domestic Short Haul Trips</option>
            <option defaultValue="Domestic Long Haul Flights">Domestic Long Haul Flights</option>
            <option defaultValue="International Flights">International Flights</option>
          </select>

          <label>Airline Name</label>
          <input type="text" name="preferred_airlines.airline_name[]" defaultValue="bbb" className="form-control input-sm" placeholder="Airline Name" />
        </div>
      </div>
      <div className="panel-footer">
        <button className="btn btn-xs btn-info btn-block mymoreprofilebutton" role="button" for="preferredAirlines">One more</button>
      </div>
    </fieldset>;
  }

});

var UserProfilePanelBlockPrograms = React.createClass({

  render: function() {
    return <fieldset style={{backgroundImage: "linear-gradient(0, #f7f7ee, #FFFFFF)"}} key={2}>

      <legend style={{marginBottom:"0px", fontSize: "18px"}}>Airlines Frequent Flier Miles Programs</legend>

      <div className="panel-body">

        <div id="milesPrograms" fieldset-number="0">
          <hr className="hidden" />
          <label>Airline Name</label>
          <input type="text" name="miles_programs.airline_name[]" className="form-control input-sm" placeholder="Airline Name" defualtValue="222" />

          <label>Account Number</label>
          <input type="text" name="miles_programs.account_number[]" className="form-control input-sm" placeholder="Account Number" defualtValue="222" />

          <label>Frequent Flier Miles</label>
          <input type="text" name="miles_programs.flier_miles[]" className="form-control input-sm" placeholder="Frequent Flier Miles" defualtValue="222" />

          <label>Expiration Date</label>
          <input type="date" name="miles_programs.expiration_date[]" className="form-control input-sm" placeholder="Expiration Date" defualtValue="222" />

        </div>

      </div>

      <div className="panel-footer">
        <button className="btn btn-xs btn-info btn-block mymoreprofilebutton" role="button" for="milesPrograms">One more</button>
      </div>

    </fieldset>;
  }

});

var UserProfilePanelBlockMembership = React.createClass({

  render: function() {
    return <fieldset style={{backgroundImage: "linear-gradient(0, #f7f7ee, #FFFFFF)"}} key={3}>

      <legend style={{marginBottom:"0px", fontSize: "18px"}}>Airline Club Lounge Memberships</legend>

      <div className="panel-body">

        <div id="loungeMembership" fieldset-number="0">
          <hr className="hidden"/>

          <label>Airline Name</label>
          <input type="text" name="lounge_membership.airline_name[]" className="form-control input-sm" placeholder="Airline Name" defualtValue="xxx" />

          <label>Club Membership Number</label>
          <input type="text" name="lounge_membership.membership_number[]" className="form-control input-sm" placeholder="Club Membership Number" defualtValue="xxx" />

          <label>Expiration Date</label>
          <input type="date" name="lounge_membership.expiration_date[]" className="form-control input-sm" defualtValue="4545-04-05" />
        </div>

      </div>

      <div className="panel-footer">
        <button className="btn btn-xs btn-info btn-block mymoreprofilebutton" role="button" for="loungeMembership">One more</button>
      </div>

    </fieldset>;
  }

});
