var UserProfilePanelBlockMembership = React.createClass({

  render: function() {

    var self = this;

    return <fieldset style={{backgroundImage: "linear-gradient(0, #f7f7ee, #FFFFFF)"}} key={3}>

      <legend style={{marginBottom:"0px", fontSize: "18px"}}>{this.props.item.title}</legend>

      <div className="panel-body">

        {

          this.props.item.data.map(function (item, index) {

            var removeButton = self.props.item.data.length > 1
              ? <input className="remove-fieldset" type="button" value="remove" data-fieldset="lounge_membership" onClick={self.props.onRemoveFieldset} /> : null;

            return <div id="lounge_membership" data-fieldset-name="lounge_membership" data-fieldset-number={index} key={index}>
              <hr className={index == 0 ? "hidden" : ""} />

              <label>Airline Name</label>

              {removeButton}

              <input type="text" name="lounge_membership.airline_name[]" className="form-control input-sm" placeholder="Airline Name" defaultValue={item.airline_name} />

              <label>Club Membership Number</label>
              <input type="text" name="lounge_membership.membership_number[]" className="form-control input-sm" placeholder="Club Membership Number" defaultValue={item.membership_number} />

              <label>Expiration Date</label>
              <input type="date" name="lounge_membership.expiration_date[]" className="form-control input-sm" defaultValue={item.expiration_date} />
            </div>
          })
        }


      </div>

      <div className="panel-footer">
        <button className="btn btn-xs btn-info btn-block mymoreprofilebutton" role="button" data-for="lounge_membership" onClick={this.props.onAddOneMore}>One more</button>
      </div>

    </fieldset>;
  }

});
