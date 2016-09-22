var UserProfilePanelBlock = React.createClass({

  onAddOneMore: function(event) {

    var cloneTarget = $(event.target).attr('data-for');
    var clone = $('#' + cloneTarget).clone().find("input").val("").end();

    clone.find('hr').removeClass('hidden');
    clone.appendTo($('#' + cloneTarget).parent());

  },

  onRemoveFieldset: function(event) {

    var fieldset = $(this).attr('data-fieldset'),
      iterator = $('*[data-fieldset-name=' + fieldset + ']' ).index( $(event.target).parents('*[data-fieldset-name=' + fieldset + ']'));

    $.ajax({
      method: "POST",
      url: "/user/removeFieldSet",
      data: {fieldset: fieldset, iterator: iterator}
    })
      .done(function( msg ) {

        if (msg.error) {

          $('#timeAlert').text('Error saving data to ' + fieldset + '.')
            .fadeIn('slow', function () {
              $(this).fadeOut(5000, function () {
              });
            }
          );

        } else {

          $('#' + fieldset + '[data-fieldset-number="' + iterator + '"]').remove();
          $('#' + fieldset + ':first > hr').remove();
          if ($('#' + fieldset + ' .remove-fieldset').length == 1) {
            $('#' + fieldset + ' .remove-fieldset').remove();
          }

          $('#timeAlert').text('Record was removed successfully.')
            .fadeIn('slow', function () {
              $(this).fadeOut(5000, function () {
              });
            }
          );
        }
      });

  },

  render: function() {

    if (this.props.item.id == 'preferred_airlines') {

      return <UserProfilePanelBlockAirlines item={this.props.item} programsStructure={this.props.programsStructure}
        onAddOneMore={this.onAddOneMore} onRemoveFieldset={this.onRemoveFieldset}/>;

    } else if (this.props.item.id == 'miles_programs') {

      return <UserProfilePanelBlockPrograms item={this.props.item} programsStructure={this.props.programsStructure}
        onAddOneMore={this.onAddOneMore} onRemoveFieldset={this.onRemoveFieldset}/>;

    } else if (this.props.item.id == 'lounge_membership') {

      return <UserProfilePanelBlockMembership item={this.props.item} programsStructure={this.props.programsStructure}
        onAddOneMore={this.onAddOneMore} onRemoveFieldset={this.onRemoveFieldset}/>;

    } else {

      return null;

    }

  }

});
