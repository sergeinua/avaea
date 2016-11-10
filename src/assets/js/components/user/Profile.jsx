var UserProfile = React.createClass({

  profileData: {
    personal: [],
    programs: [],
    profileStructure: {},
    programsStructure: {}
  },

  render_count: 1,

  makeProfileData: function(incData) {

    var profile_fields = incData.profile_fields;

    if ($.isEmptyObject(profile_fields)) {
      profile_fields.personal_info = {address: {}};
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
    return fetch('/profile/get', {
      credentials: 'same-origin' // required for including auth headers
    })
      .then((response) => {
        return response.json();
      })
      .then((json) => {
        return json;
      })
      .catch(function (error) {
        console.log(error);
      });
  },

  postProfile: function() {
    return fetch('/profile/update', {
      method: 'POST',
      body: JSON.stringify(this.props.profileData),
      credentials: 'same-origin' // required for including auth headers
    })
      .then((response) => {
        return response.json();
      })
      .then((json) => {
        return json;
      })
      .catch(function (error) {
        console.log(error);
      });
  },

  execUpdate: function () {
    this.props.loadProfileSuccess({});
    this.postProfile()
      .then(function (resData) {
        resData.error ? this.props.loadProfileFailed() : this.props.loadProfileSuccess(this.makeProfileData(resData));
      }.bind(this))
      .catch(function (error) {
        console.log(error);
      });
  },

  componentDidMount: function() {
    clientStore.subscribe(() => console.log('_store:', clientStore.getState()));

    this.getProfile()
      .then(function (resData) {
        resData.error ? this.props.loadProfileFailed() : this.props.loadProfileSuccess(this.makeProfileData(resData));
      }.bind(this))
      .catch(function (error) {
        console.log(error);
      });
  },

  render: function () {
    console.log('render'+(this.render_count++), this.profileData, this.profileData.personal.length);
    if (this.props.profileData.personal) {
      return <div>
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
          <button type="submit" className="big-button" onClick={this.execUpdate}>Save</button>
        </div>
      </div>;
    }
    else if (this.props.profileData.error) {
      return <DisplayAlert tryUrl="/profile/get"/>;
    }

    return <div className="nothing-found"><div className="copy">Loading..</div></div>;
  }

});

const mapStateToProps = function(store) {
  return {
    profileData: store.profileData,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    loadProfileSuccess: (data) => {
      dispatch(actionLoadProfileSuccess(data))
    },
    loadProfileFailed: () => {
      dispatch(actionLoadProfileFailed())
    },
  }
};

var UserProfileContainer = ReactRedux.connect(mapStateToProps, mapDispatchToProps)(UserProfile);
