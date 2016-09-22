var UserProfilePanelBlockPrograms = React.createClass({

  render: function() {

    var self = this;

    return <fieldset style={{backgroundImage: "linear-gradient(0, #f7f7ee, #FFFFFF)"}} key={2}>

      <legend style={{marginBottom:"0px", fontSize: "18px"}}>{this.props.item.title}</legend>

      <div className="panel-body">

        {

          this.props.item.data.map(function (item, index) {

            var removeButton = self.props.item.data.length > 1
              ? <input className="remove-fieldset" type="button" value="remove" data-fieldset="miles_programs" onClick={self.props.onRemoveFieldset} /> : null;

            return <div id="miles_programs" data-fieldset-name="miles_programs" data-fieldset-number={index} key={index}>
              <hr className={index == 0 ? "hidden" : ""} />
              <label>Airline Name</label>

              {removeButton}

              <input type="text" name="miles_programs.airline_name[]" className="form-control input-sm" placeholder="Airline Name" defaultValue={item.airline_name} />

              <label>Account Number</label>
              <input type="text" name="miles_programs.account_number[]" className="form-control input-sm" placeholder="Account Number" defaultValue={item.account_number} />

              <label>Frequent Flier Miles</label>
              <input type="text" name="miles_programs.flier_miles[]" className="form-control input-sm" placeholder="Frequent Flier Miles" defaultValue={item.flier_miles} />

              <label>Expiration Date</label>
              <input type="date" name="miles_programs.expiration_date[]" className="form-control input-sm" placeholder="Expiration Date" defaultValue={item.expiration_date} />

            </div>
          })
        }

      </div>

      <div className="panel-footer">
        <button className="btn btn-xs btn-info btn-block mymoreprofilebutton" role="button" data-for="miles_programs" onClick={this.props.onAddOneMore}>One more</button>
      </div>

    </fieldset>;
  }

});
