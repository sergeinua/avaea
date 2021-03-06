var UserProfilePanelBlockPrograms = React.createClass({

  getInitialState: function() {
    return {item: {}};
  },

  componentWillReceiveProps: function(nextProps) {
    var state = this.state;

    state.item = nextProps.item;
    if (!state.item.data.length) {
      state.item.data.push(this.props.programsStructure.miles_programs);
    }
    this.setState(state);
  },

  componentWillMount: function() {
    var state = this.state;

    state.item = this.props.item;
    if (!state.item.data.length) {
      state.item.data.push(this.props.programsStructure.miles_programs);
    }
    this.setState(state);
  },

  handleChangeValue: function (event, elemNum, fieldName) {
    clientStore.dispatch(actionSetProgramsVal(this.props.blockNum, elemNum, fieldName, event.target.value));
  },

  render: function() {

    var self = this;

    return <fieldset className="fieldset" key={'miles_programs'}>
      <legend className="legend">{this.state.item.title}</legend>
      <div className="panel-body">
        {
          this.state.item.data.map(function (item, index) {

            return <div id="miles_programs" data-fieldset-name="miles_programs" key={'miles_programs' + item.airline_name + index}>
              <hr className={index == 0 ? "hidden" : ""} />

              <label>Airline Name</label>
              <span className={"remove-fieldset " + (self.state.item.data.length > 1 ? "" : "hide")}
                    data-fieldset="miles_programs" onClick={self.props.onRemoveFieldset} >remove</span>
              <UserProfilePanelAirlineSelect
                elem_name={"miles_programs.airline_name["+index+"]"}
                elem_value={item.airline_name}
                blockNum={self.props.blockNum}
                elemNum={index}
              />

              <label>Account Number</label>
              <input type="text" name="miles_programs.account_number[]" className="form-control input-sm" placeholder="Account Number" defaultValue={item.account_number}
                     onBlur={(event) => self.handleChangeValue(event, index, 'account_number')}/>

              <label>Frequent Flier Miles</label>
              <input type="text" name="miles_programs.flier_miles[]" className="form-control input-sm" placeholder="Frequent Flier Miles" defaultValue={item.flier_miles}
                     onBlur={(event) => self.handleChangeValue(event, index, 'flier_miles')}/>

              <label>Expiration Date</label>
              <input type="date" name="miles_programs.expiration_date[]" className="form-control input-sm" placeholder="Expiration Date" defaultValue={item.expiration_date}
                     onBlur={(event) => self.handleChangeValue(event, index, 'expiration_date')}/>

            </div>
          })
        }
      </div>

      <div className="panel-footer">
        <button type="button" data-for="miles_programs" onClick={this.props.onAddOneMore}>One more</button>
      </div>

    </fieldset>;
  }

});
