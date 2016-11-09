var UserProfile = React.createClass({

  profileData: {
    personal: [],
    programs: []
  },

  profileStructure: null,
  programsStructure: null,

  render_count: 1,

  componentWillMount: function() {
    console.log('_PROPS_1', this.props);

    if ($.isEmptyObject(this.props.profileData)) {
      this.props.profileData.personal_info = {address: {}};
      this.props.profileData.notify_contact = {};
    }

    this.profileData.personal = [
      {id:'first_name', required: true, title: 'First Name', data: this.props.profileData.personal_info.first_name || ''},
      {id:'middle_name', title: 'Middle Name', data: this.props.profileData.personal_info.middle_name || ''},
      {id:'last_name', required: true, title: 'Last Name', data: this.props.profileData.personal_info.last_name || ''},
      {id:'gender', title: 'Gender', data: this.props.profileData.personal_info.gender || ''},
      {id:'birthday', type: "date", title: 'Birthday', placeholder: 'YYYY-MM-DD', data: this.props.profileData.personal_info.birthday || ''},
      {id:'street', title: 'Address', data: this.props.profileData.personal_info.address.street || ''},
      {id:'city', title: 'City', data: this.props.profileData.personal_info.address.city || ''},
      {id:'state', title: 'State', data: this.props.profileData.personal_info.address.state || ''},
      {id:'zip_code', title: 'Zip Code', data: this.props.profileData.personal_info.address.zip_code || ''},
      {id:'country_code', title: 'Country Code', data: this.props.profileData.personal_info.address.country_code || ''},
      {id:'notify_contact.name', title: 'In Case of Emergency Notify', placeholder: 'First and Last Name', data: this.props.profileData.notify_contact.name || ''},
      {id:'notify_contact.phone', title: 'Emergency Notify Phone', placeholder: 'Phone number', data: this.props.profileData.notify_contact.phone || ''}
    ];

    this.profileData.programs = [
      {id:'preferred_airlines', title: 'Preferred Airlines', data: this.props.profileData.preferred_airlines || []},
      {id:'miles_programs', title: 'Airlines Frequent Flier Miles Programs', data: this.props.profileData.miles_programs || []},
      {id:'lounge_membership', title: 'Airline Club Lounge Memberships', data: this.props.profileData.lounge_membership || []}
    ];

    this.profileStructure = this.props.profileStructure;

    this.programsStructure = {
      preferred_airlines: {travel_type: '', airline_name: ''},
      miles_programs: {airline_name: '', account_number: '', flier_miles: '', expiration_date: ''},
      lounge_membership: {airline_name: '', membership_number: '', expiration_date: ''}
    };

    this.programsStructure = $.extend(true, this.programsStructure, this.props.programsStructure);

  },

  getProfile: function() {
    return fetch('/profile', {
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

  componentDidMount: function() {
    let unsubscribe = clientStore.subscribe(() =>
      console.log('_store:', clientStore.getState())
    );

    this.getProfile()
      .then(function (resData) {

        this.profileData.personal[0].data = resData.profile_fields.personal_info.first_name + '_added';

        clientStore.dispatch(actionLoadProfileSuccess(this.profileData));
        console.log('_PROPS_2', this.props);
      }
      .bind(this))
      .catch(function (error) {
        console.log(error);
      });
  },

  render: function () {
    console.log('render'+(this.render_count++), this.props.profileDataOut);
    if (this.props.profileDataOut.personal) {
      return <div className="user-profile">
        <UserProfilePanel type="personal" profileStructure={this.profileStructure} data={this.props.profileDataOut.personal} id="One1" name="Personal information" key="One"/>
        <UserProfilePanel type="programs" programsStructure={this.programsStructure} data={this.props.profileDataOut.programs} id="Two2" name="Airlines/Programs" key="Two"/>
      </div>;
    }

    return <div className="user-profile">Loading..</div>
  }

});

const mapStateToProps = function(store) {
  return {
    profileDataOut: {
      personal : store.profileData.personal,
      programs : store.profileData.programs
    }
  };
};

var UserProfileContainer = ReactRedux.connect(mapStateToProps)(UserProfile);
