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
    this.programsStructure = this.props.programsStructure;

  },

  render: function () {
    return <div>
        <UserProfilePanel type="personal" profileStructure={this.profileStructure} data={this.profileData.personal} id="One1" name="Personal information" key="One" />
        <UserProfilePanel type="programs" programsStructure={this.programsStructure} data={this.profileData.programs} id="Two2" name="Airlines/Programs" key="Two" />
      </div>;
  }

});
