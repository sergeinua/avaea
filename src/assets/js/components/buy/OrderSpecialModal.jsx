
var OrderSpecialModal = React.createClass({

  render: function () {

    return (
      <div className="modal continuous-search" id="user-price-modal" role="dialog">
        <div className="modal-dialog">
          <div className="modal-content">

            <div className="title-bar">
              <div className="close-x" onClick={() => {window.history.back();return false;}}></div>
              <div className="title">Choose Your Price zz</div>
            </div>

            <form role="form" id="form_user_price">

              <div className="modal-body">
                <div className="sub-title">Continuous search for better price.</div>

                <div className="form-group">
                  <label className="required" htmlFor="user_price">Price you commit for this itinerary:</label>
                  <input type="text" className="form-control input-sm" id="user_price" name="user_price" placeholder="Enter your price"/>
                </div>
                <div className="form-group">
                  <label className="required" htmlFor="user_timelimit">Time limit for getting the fare:</label>
                  <input type="text" className="form-control input-sm" id="user_timelimit" name="user_timelimit" placeholder="Enter days"/>
                </div>

              </div>

              <div className="buttons-bar double">
                <button type="button" className="big-button secondary" onClick={() => {window.history.back();return false;}}>Cancel</button>
                <button type="submit" className="big-button" id="user-price-submit">Submit</button>
              </div>

            </form>

          </div>
        </div>
      </div>
    );
  }

});