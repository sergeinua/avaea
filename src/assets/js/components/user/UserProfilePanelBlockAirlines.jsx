var UserProfilePanelBlockAirlines = React.createClass({

  render: function() {

    var self = this;

    return <fieldset style={{backgroundImage: "linear-gradient(0, #f7f7ee, #FFFFFF)"}} key={1}>
      <legend style={{marginBottom: "0px", fontSize: "18px"}}>{this.props.item.title}</legend>
      <div className="panel-body">

        {
          this.props.item.data.map(function(item, index) {

            var pseudoItem = {id: 'preferred_airlines.travel_type[]', data: item.travel_type},
              removeButton = self.props.item.data.length > 1
                ? <input className="remove-fieldset" type="button" value="remove" data-fieldset="preferred_airlines" onClick={self.props.onRemoveFieldset} /> : null;


            return <div id="preferred_airlines" data-fieldset-name="preferred_airlines" data-fieldset-number={index} key={index}>
              <hr className={index == 0 ? "hidden" : ""} />
              <label>Preferred Airlines type</label>

              {removeButton}

              <UserProfilePanelElementDropdown item={pseudoItem} profileStructure={self.props.programsStructure.travel_type}/>

              <label>Airline Name</label>
              <input type="text" name="preferred_airlines.airline_name[]" defaultValue={item.airline_name} className="form-control input-sm" placeholder="Airline Name" />
            </div>

          })
        }
      </div>
      <div className="panel-footer">
        <button className="btn btn-xs btn-info btn-block mymoreprofilebutton" role="button" data-for="preferred_airlines" onClick={this.props.onAddOneMore}>One more</button>
      </div>
    </fieldset>;
  }

});
