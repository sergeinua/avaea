/* global $ */
var UserProfileData, UserProfileStructure, UserProgramsStructure;

$(document).ready(function() {
  if (UserProfileData && UserProfileStructure && UserProgramsStructure) {
    // ReactContentRenderer.render(<UserProfile profileData={UserProfileData} profileStructure={UserProfileStructure}
    //                                          programsStructure={UserProgramsStructure}/>, $('#UserProfile'));
    ReactContentRenderer.render(
      <ReactRedux.Provider store={clientStore}>
        <UserProfileContainer profileData={UserProfileData} profileStructure={UserProfileStructure} programsStructure={UserProgramsStructure}/>
      </ReactRedux.Provider>, $('#UserProfile')
    );
  }
});
