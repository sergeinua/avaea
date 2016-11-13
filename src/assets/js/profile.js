/* global $ */
// <UserProfileContainer profileStructure={UserProfileStructure} programsStructure={UserProgramsStructure}/>
$(document).ready(function() {
  if ($('#UserProfile').length) {
    ReactContentRenderer.render(
      <ReactRedux.Provider store={clientStore}>
        <UserProfileContainer />
      </ReactRedux.Provider>, $('#UserProfile')
    );
  }
});
