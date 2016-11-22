
$(document).ready(function() {

  if ($('#OrderPanel').length) {
    ReactContentRenderer.render(
      <ReactRedux.Provider store={clientStore}>
        <OrderPanelContainer itineraryId={itineraryId} specialOrder={specialOrder} />
      </ReactRedux.Provider>, $('#OrderPanel')
    );

    if ($('#OrderSpecialModal').length && specialOrder) {
      ReactContentRenderer.render(
        <ReactRedux.Provider store={clientStore}>
          <OrderSpecialModal />
        </ReactRedux.Provider>, $('#OrderSpecialModal')
      );
    }
  }

});
