/* global $ */
// <UserProfileContainer profileStructure={UserProfileStructure} programsStructure={UserProgramsStructure}/>
$(document).ready(function() {
  ReactContentRenderer.render(
    <ReactRedux.Provider store={clientStore}>
      <UserProfileContainer />
    </ReactRedux.Provider>, $('#UserProfile'));
});
