$(document).ready(function(){

  $(document)
  .on('blur', '.abo-search-input', function(){ // save all changes in this point
    var _this = $(this),
        name = (''+_this.attr('name')).replace('_label', ''),
        activeLi = $('#abo-search-result li.active');
        
    if(_this.hasClass('ffm-program-name')){
      _this.data('tier', activeLi.data('tier'));
      _this.parent().find('input').val(''); // clear all fields after changing of program
    }

    if (_this.hasClass('airline-name')) {
      _this.parent().find('[name*="airline_iata_2code"]').val(activeLi.data('iata'));
    }

    var arc = _this.data('arc');
    if(('' + arc).length > 0){
      _this.val(arc); // restore data from archive
    }else{
      _this.val(activeLi.data('label')); // show label
      _this.parent().find('input[name="'+name+'"]').val(activeLi.data('value')); // save value      
    }
   
    // close list of found items
    $('#abo-search-result').fadeTo(400, 0, function(){$(this).remove();});
  })
  .on('focus', '.abo-search-input', function(event){
    $(this).trigger('keyup');
    $(this).data('arc', $(this).val());
  })
  .on('keyup', '.abo-search-input', function(event){
    var _this = $(this), q = _this.val();

    if(event.keyCode === 40){ //pressed arrow down
      var n = $('#abo-search-result li.active').data('num'), 
          l = $('#abo-search-result li').length;

      n = (typeof n === 'undefined')? 0: n+1;
      if(n > l-1) n = l - 1;

      $('#abo-search-result li').removeClass('active');
      $($('#abo-search-result li').get(n)).addClass('active');
      return false;
    }else if(event.keyCode === 38){ //pressed arrow up
      var n = $('#abo-search-result li.active').data('num');

      n = (n === NaN)? 0: n-1;
      if(n < 0) n = 0;

      $('#abo-search-result li').removeClass('active');      
      $($('#abo-search-result li').get(n)).addClass('active');      
      return false;
    }else if(event.keyCode === 37 || event.keyCode === 39){ //pressed arrow left or arrow right
      return false;
    }else if(event.keyCode === 13){ //pressed enter
      _this.data('arc', '').blur();
      return false;
    }else if(event.keyCode === 27){
      _this.blur();
      return false;
    }    

  $('#abo-search-result').remove(); // remove old search results
  
  var panel = $('<div/>')
               .attr('id', 'abo-search-result')
               .addClass('panel panel-default')
               .width(_this.outerWidth())
               .offset({top: _this.offset().top+_this.outerHeight(), left: _this.offset().left})
               .css({position: 'absolute', 'overflow-y': 'auto', 'max-height': '200px'});              
  var list = $('<ul/>').addClass('list-group'); 
  
  if(_this.hasClass('airline-name')){
    window.socketAbo.post('/ac/airlines', {q: q}, function(json){
        if(json.error){
            console.log('airlines:', json.error);
        } else {
            var airlines = json;
            
            // create panel with airlines list
            if(airlines.length > 0){    
              
              for(var i = 0; i < airlines.length; i++){
                var airline = airlines[i];

                $('<li/>')
                    .addClass('list-group-item')
                    .data('num', i)
                    .data('value', airline.value)
                    .data('label', airline.label)
                    .data('iata', airline.iata_2code)
                    .text(airline.label).css({cursor: 'pointer'})
                    .off()
                    .on('click', function(){_this.data('arc', '').blur();})
                    .on('mouseover', function(){
                      $('#abo-search-result li').removeClass('active');
                      $(this).addClass('active');
                    }).appendTo(list);                             
              }
              
              list.appendTo(panel);
              panel.appendTo(_this.parent());
            }            
        }
    });      
  }else if(_this.hasClass('ffm-program-name')){
    window.socketAbo.post('/ac/ffm_airlines', {q: q}, function(json){
        if(json.error){
            console.log('ffm_airlines:', json.error);
        } else {
            var ffmprograms = json;
            
            // create panel with airlines list
            if(ffmprograms.length > 0){    
                                       
              for(var i = 0; i < ffmprograms.length; i++){
                var ffmprogram = ffmprograms[i];                
                var tier = JSON.stringify(ffmprogram.tier);

                var li = $('<li/>')
                            .addClass('list-group-item')
                            .data('num', i)
                            .data('value', ffmprogram.value)
                            .data('label', ffmprogram.label)
                            .data('tier', tier)
                            .text(ffmprogram.label).css({cursor: 'pointer'})
                            .off()
                            .on('click', function(){_this.data('arc', '').blur();})
                            .on('mouseover', function(){
                              $('#abo-search-result li').removeClass('active');
                              $(this).addClass('active');
                            });               
                li.appendTo(list);                
              }
              
              panel.appendTo(_this.parent());
              list.appendTo(panel);                        
            }            
          }
      });
    }else if(_this.hasClass('ffm-program-tier')){ // creates a list of tier of a ffm program

      var tier = _this.parent().find('.ffm-program-name').data('tier');
      if(typeof tier !== 'object'){
        try{
          tier = JSON.parse(tier);
        }catch(err){ tier = []; }
      }


      for(var i = 0; i < tier.length; i++){
        var li = $('<li/>')
                    .addClass('list-group-item')
                    .data('num', i)
                    .data('value', tier[i].ta)
                    .data('label', tier[i].tn)
                    .text(tier[i].tn).css({cursor: 'pointer'})
                    .off()
                    .on('click', function(){ _this.data('arc', '').blur();})
                    .on('mouseover', function(){
                      $('#abo-search-result li').removeClass('active');
                      $(this).addClass('active');
                    });               
        li.appendTo(list);        
      }
      panel.appendTo(_this.parent());
      list.appendTo(panel);      
    }
  });
  
});
  

$('.addMilesProgram').click(function(event){
    event.stopPropagation();
    var fieldsets = $('.miles_programs');
    if(fieldsets.length === 0) return false;
    // get last fieldset
    
    var iterator = parseInt(fieldsets.last().attr('fieldset-number'));
    iterator++;
    
    // gets base fieldset for clone
    var base = $(fieldsets.get(0));
    var clone = base.clone();
    // updates the elements which contain iterator values
    clone.attr('fieldset-number', iterator);
    clone.find('.remove-fieldset').attr('iterator', iterator).show().click(function(){
        //temporary function before updating of profile page
        $(this).parents('.miles_programs').remove();
    });    
    clone.find('.ffm-program-name').attr('name', 'miles_programs.program_name_label['+iterator+']').val('');
    clone.find('.ffm-program-name-hidden').attr('name', 'miles_programs.program_name['+iterator+']').val('');
    
    clone.find('.ffm-program-tier').attr('name', 'miles_programs.tier_label['+iterator+']').val('');
    clone.find('.ffm-program-tier-hidden').attr('name', 'miles_programs.tier['+iterator+']').val('');    

    clone.find('.ffm-program-account-number').attr('name', 'miles_programs.account_number['+iterator+']').val('');    
    clone.find('hr').removeClass('hidden');

    // appends the clone to the parent element 
    clone.appendTo(base.parent());
    
    return false;  
});


$('.addPreferredAirlines').click(function(event){
    event.stopPropagation();
        
    var fieldsets = $('.preferred_airlines');
    if(fieldsets.length === 0) return false;
    // get last fieldset
    
    var iterator = parseInt(fieldsets.last().attr('fieldset-number'));
    iterator++;
    
    // gets base fieldset for clone
    var base = $(fieldsets.get(0));
    var clone = base.clone();
    // updates the elements which contain iterator values
    clone.attr('fieldset-number', iterator);
    clone.find('.remove-fieldset').attr('iterator', iterator).show().click(function(){
        //temporary function before updating of profile page
        $(this).parents('.preferred_airlines').remove();
    });
    clone.find('input[type=radio]').attr('name', 'preferred_airlines.travel_type['+iterator+']').removeProp('checked');
    clone.find('input[type=text]').attr('name', 'preferred_airlines.airline_name_label['+iterator+']').val('');
    clone.find('input[type=hidden][name*="preferred_airlines.airline_name"]').attr('name', 'preferred_airlines.airline_name['+iterator+']').val('');
    clone.find('input[type=hidden][name*="preferred_airlines.airline_iata_2code"]').attr('name', 'preferred_airlines.airline_iata_2code['+iterator+']').val('');
    clone.find('hr').removeClass('hidden');
    
    // appends the clone to the parent element 
    clone.appendTo(base.parent());
    // set All Flights as default 
    $(clone.find('input[type=radio]').get(0)).prop('checked', true).click();

    return false;
});


$('.mymoreprofilebutton').click(function(el) {
  var cloneTarget = $(this).attr('for');
  var clone = $('#' + cloneTarget).clone().find("input").val("").end();


  clone.find('hr').removeClass('hidden');
  clone.appendTo($('#' + cloneTarget).parent());
  return false;
});

//remove fieldset
$('.remove-fieldset').click(function(event){
  var fieldset = $(this).attr('fieldset'), iterator = $(this).attr('iterator'); 

  window.socketAbo.post("/user/removeFieldSet", {fieldset: fieldset, iterator: iterator}, function( msg ) {
    if (msg.error) {

      $('#timeAlert').text('Error saving data to ' + fieldset + '.')
        .fadeIn('slow', function () {
          $(this).fadeOut(5000, function () {
            $('body').css('padding-top', ($('#tiles_ui').outerHeight(true) ) + 'px');
          });
        }
      );

    } else {

      $('#' + fieldset + '[fieldset-number="' + iterator + '"]').remove();
      $('#' + fieldset + ':first > hr').remove();
      if ($('#' + fieldset + ' .remove-fieldset').length == 1) {
        $('#' + fieldset + ' .remove-fieldset').remove();
      }
          
    // in "preferred_airlines, miles_program" has been used attribute "class" instead id
    $('.' + fieldset + '[fieldset-number="' + iterator + '"]').remove(); 
  
      $('#timeAlert').text('Record was removed successfully.')
        .fadeIn('slow', function () {
          $(this).fadeOut(5000, function () {
            $('body').css('padding-top', ($('#tiles_ui').outerHeight(true) ) + 'px');
          });
        }
      );
    }
  });
});
