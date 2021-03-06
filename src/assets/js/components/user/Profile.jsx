var UserProfile = React.createClass({

  profileData: {
    personal: [],
    programs: [],
    profileStructure: {},
    programsStructure: {}
  },

  makeProfileData: function(incData) {

    var profile_fields = incData.profileFields;
    if (!profile_fields || (typeof profile_fields != 'object')) {
      profile_fields = {};
    }
    if (!profile_fields.personal_info) {
      profile_fields.personal_info = {address: {}}
    }
    if (!profile_fields.notify_contact) {
      profile_fields.notify_contact = {};
    }

    this.profileData.personal = [
      {id:'personal_info.first_name', required: true, title: 'First Name', data: profile_fields.personal_info.first_name || ''},
      {id:'personal_info.middle_name', title: 'Middle Name', data: profile_fields.personal_info.middle_name || ''},
      {id:'personal_info.last_name', required: true, title: 'Last Name', data: profile_fields.personal_info.last_name || ''},
      {id:'personal_info.gender', title: 'Gender', data: profile_fields.personal_info.gender || ''},
      {id:'personal_info.birthday', type: "date", title: 'Birthday', placeholder: 'YYYY-MM-DD', data: profile_fields.personal_info.birthday || ''},
      {id:'personal_info.address.street', title: 'Address', data: profile_fields.personal_info.address.street || ''},
      {id:'personal_info.address.city', title: 'City', data: profile_fields.personal_info.address.city || ''},
      {id:'personal_info.address.state', title: 'State', data: profile_fields.personal_info.address.state || ''},
      {id:'personal_info.address.zip_code', title: 'Zip Code', data: profile_fields.personal_info.address.zip_code || ''},
      {id:'personal_info.address.country_code', title: 'Country Code', data: profile_fields.personal_info.address.country_code || ''},
      {id:'notify_contact.name', title: 'In Case of Emergency Notify', placeholder: 'First and Last Name', data: profile_fields.notify_contact.name || ''},
      {id:'notify_contact.phone', title: 'Emergency Notify Phone', placeholder: 'Phone number', data: profile_fields.notify_contact.phone || ''}
    ];

    this.profileData.programs = [
      {id:'preferred_airlines', title: 'Preferred Airlines', data: profile_fields.preferred_airlines || []},
      {id:'miles_programs', title: 'Airlines Frequent Flier Miles Programs', data: profile_fields.miles_programs || []},
      {id:'lounge_membership', title: 'Airline Club Lounge Memberships', data: profile_fields.lounge_membership || []}
    ];

    this.profileData.profileStructure = incData.profileStructure;

    this.profileData.programsStructure = Object.assign({},
    {
      preferred_airlines: {travel_type: '', airline_name: ''},
      miles_programs: {airline_name: '', account_number: '', flier_miles: '', expiration_date: ''},
      lounge_membership: {airline_name: '', membership_number: '', expiration_date: ''}
    },
      incData.programsStructure);

    return this.profileData;
  },

  getProfile: function() {
    return ClientApi.reqPost('/profile/get');
  },

  postProfile: function() {
    return ClientApi.reqPost('/profile/update', {
      personal: this.props.profileData.personal,
      programs: this.props.profileData.programs,
    });
  },

  execUpdate: function () {
    this.props.loadProfileSuccess({});
    this.postProfile()
      .then(function (resData) {
        resData.error ? this.props.loadProfileFailed() : this.props.loadProfileSuccess(this.makeProfileData(resData));
      }.bind(this))
      .catch(function (error) {
        console.error(error);
      });
  },

  componentDidMount: function() {
    this.getProfile()
      .then(function (resData) {
        resData.error ? this.props.loadProfileFailed() : this.props.loadProfileSuccess(this.makeProfileData(resData));
      }.bind(this))
      .catch(function (error) {
        console.error(error);
      });
  },

  render: function () {
    if (this.props.profileData.personal) {
      return <form action="user/update" name="Profile" id="Profile" method="post" className="form profile">
        <div className="panel-group" id="accordion" role="tablist" aria-multiselectable="true">
          <div className="user-profile">
            <UserProfilePanel
              type="personal"
              profileStructure={this.props.profileData.profileStructure}
              data={this.props.profileData.personal}
              id="One1"
              name="Personal information"
              key="One"
            />
            <UserProfilePanel
              type="programs"
              programsStructure={this.props.profileData.programsStructure}
              data={this.props.profileData.programs}
              id="Two2"
              name="Airlines/Programs"
              key="Two"
            />
          </div>
          <div className="button-holder">
            <button type="button" className="big-button" onClick={this.execUpdate}>Save</button>
          </div>
        </div>
      </form>;
    }
    else if (this.props.profileData.error) {
      return <DisplayAlert tryUrl="/profile"/>;
    }

    return <Loader/>;
  }

});

const mapStateProfile = function(store) {
  return {
    profileData: store.profileData,
  };
};

const mapDispatchProfile = (dispatch) => {
  return {
    loadProfileSuccess: (data) => {
      dispatch(actionLoadProfileSuccess(data))
    },
    loadProfileFailed: () => {
      dispatch(actionLoadProfileFailed())
    },
  }
};

var UserProfileContainer = ReactRedux.connect(mapStateProfile, mapDispatchProfile)(UserProfile);
