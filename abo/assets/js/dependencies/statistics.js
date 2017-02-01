
var generateGridSearch = function (nameFilter, data) {
  if (!data.length) return;
  var dataFilterGrid = [];
  data.forEach(function (item) {
    if (item.actionType == nameFilter) {
      dataFilterGrid.push(getRowGridSearch(item));
    }
  });

  $('#jsGrid').jsGrid('destroy');
  $('#jsGrid').jsGrid({
    height: '470px',
    width: '100%',
    inserting: false,
    editing: false,
    sorting: true,
    paging: false,
    filtering: false,
    autoload: true,
    controller: {
      loadData: function () {
        return dataFilterGrid;
      }
    },
    fields: [
      {name: 'createdAt', title: 'Date', type: 'date'},
      {name: 'id', title: 'Id', type: 'number'},
      {name: 'DepartureLocationCode', title: 'From', type: 'text', autosearch: true},
      {name: 'ArrivalLocationCode', title: 'To', type: 'text'},
      {name: 'departureDate', title: 'Departure Date', type: 'date'},
      {name: 'returnDate', title: 'Return Date', type: 'date'},
      {name: 'serviceProvider', title: 'Name API', type: 'text'},
      {name: 'serviceCount', title: 'Count', type: 'number'},
      {name: 'serviceTimeWork', title: 'Time', type: 'date'},
      {name: 'voiceQuery', title: 'Voice Query', type: 'text'},
      {name: 'voiceParsedQuery', title: 'Parsed Query', type: 'text'}
    ]
  });
};

var getRowGridSearch = function (row) {
  var serviceClass = {
    E:'Economy',
    P:'Premium',
    B:'Business',
    F:'First'
  };

  return {
    email: (row.user && row.user.email) ? row.user.email : '--na--',
    createdAt: new Date(row.createdAt).toLocaleString(),
    createdDt: new Date(row.createdAt).toLocaleString("en-US", {month: 'short', day: '2-digit', year: '2-digit'}),
    createdTime: new Date(row.createdAt).toLocaleString("en-US", {hour: '2-digit', minute: '2-digit', second: '2-digit'}),
    id: row.id,
    DepartureLocationCode: row.logInfo.searchParams.DepartureLocationCode || '-- na --',
    ArrivalLocationCode: row.logInfo.searchParams.ArrivalLocationCode || '-- na --',
    departureDate: moment(row.logInfo.searchParams.departureDate, 'DD/MM/YYYY').format('MMM DD, YY') || '-- na --',
    returnDate: row.logInfo.searchParams.returnDate ? moment(row.logInfo.searchParams.returnDate, 'DD/MM/YYYY').format('MMM DD, YY') : '',
    passengers: row.logInfo.searchParams.passengers || 0,
    CabinClass: serviceClass[row.logInfo.searchParams.CabinClass] || '-- na --',
    topSearchOnly: (row.logInfo.searchParams.topSearchOnly ? 'Top Flights' : 'All Flights'),
    serviceProvider: (row.logInfo.searchInfoByProviders && row.logInfo.searchInfoByProviders.length) ?
      row.logInfo.searchInfoByProviders.map(function (it) {
        return it.name + '<br/>';
      }) : '--na--',
    result: (row.logInfo.error && row.logInfo.error.toLowerCase() != 'no results found') ? 'failed' : 'success',
    serviceCount: (row.logInfo.searchInfoByProviders && row.logInfo.searchInfoByProviders.length) ?
      row.logInfo.searchInfoByProviders.map(function (it) {
        return it.count + '<br/>';
      }) : 0,
    serviceTimeWork: (row.logInfo.searchInfoByProviders && row.logInfo.searchInfoByProviders.length) ?
      row.logInfo.searchInfoByProviders.map(function (it) {
        return it.timeStr + '<br/>';
      }) : '--na--',
    timeWork: row.logInfo.timeWorkStr || '--na--',
    voiceQueryVS: (row.logInfo.searchParams.query) ? row.logInfo.searchParams.query : '--na--',
    voiceParsedQueryVS: (row.logInfo.searchParams && typeof row.logInfo.searchParams == 'object')
      ? Object.keys(row.logInfo.searchParams).map(function (key) {
        if (key != 'query') {
          return '<b>' + key + '</b>: ' + row.logInfo.searchParams[key] + '<br/>';
        }
    }) : '--na--'
  };
};

var insertRowToGrid = function (el, row) {
  $(el).jsGrid('insertItem', getRowGridSearch(row)).done(function () {
    var sorting = $(el).jsGrid('getSorting');
    if (sorting)
      $(el).jsGrid('sort', sorting);
  });
};


var generateGridUsersStat = function () {
  $('#gridUsersStat').jsGrid('destroy');
  $('#gridUsersStat').jsGrid({
    height: '550px',
    width: '100%',
    css: "cell-ellipsis",
    inserting: false,
    editing: false,
    sorting: true,
    paging: false,
    filtering: false,
    autoload: true,
    controller: {
      loadData: function (data) {
        return data;
      }
    },
    fields: [
      {name: 'id', title: 'Id', type: 'number', sorter: "number", width: 100, align: "center"},
      {name: 'email', title: 'Email', type: 'text', width: 100, align: "center"},
      {name: 'createdDt', title: 'Date', type: 'date', width: 100, align: "center"},
      {name: 'createdTime', title: 'Time', type: 'date', width: 100, align: "center"},
      {name: 'DepartureLocationCode', title: 'From', type: 'text', autosearch: true, width: 100, align: "center"},
      {name: 'ArrivalLocationCode', title: 'To', type: 'text', width: 100, align: "center"},
      {name: 'departureDate', title: 'Departing', type: 'date', width: 100, align: "center"},
      {name: 'returnDate', title: 'Returning', type: 'date', width: 100, align: "center"},
      {name: 'passengers', title: 'Passengers', type: 'number', width: 100, align: "center"},
      {name: 'CabinClass', title: 'Class', type: 'string', width: 100, align: "center"},
      {name: 'topSearchOnly', title: 'Action', type: 'string', width: 100, align: "center"},
      {name: 'serviceProvider', title: 'Provider', type: 'text', width: 100, align: "center"},
      {name: 'result', title: 'Result', type: 'text', width: 100, align: "center"},
      {name: 'serviceTimeWork', title: 'Latency', type: 'date', width: 100, align: "center"},
      {name: 'serviceCount', title: 'Itins', type: 'number', width: 100, align: "center"},
      {name: 'timeWork', title: 'Processing time', type: 'date', width: 100, align: "center"}
    ]
  });
};

var generateGridOverallStat = function () {
  $('#gridOverallStat').jsGrid('destroy');
  $('#gridOverallStat').jsGrid({
    height: '200px',
    width: '100%',
    inserting: false,
    editing: false,
    sorting: false,
    paging: false,
    filtering: false,
    autoload: true,
    controller: {
      loadData: function (data) {
        return getRowGridOverallStat(data);
      }
    },
    fields: [
      {name: 'period', title: 'Period', type: 'text'},
      {name: 'totalReq', title: 'Total Requests', type: 'number'},
      {name: 'totalSuccesses', title: 'Successes', type: 'number'},
      {name: 'totalFailures', title: 'Failures', type: 'number'},
      {name: 'avgMondee', title: 'Mondee avg. latency', type: 'number'},
      {name: 'avgTime', title: 'Avg. processing time', type: 'number'}
    ]
  });
};

var genGridUsersStatVoiceSearch = function () {
  $('#gridUsersStatVoiceSearch').jsGrid('destroy');
  $('#gridUsersStatVoiceSearch').jsGrid({
    height: '550px',
    width: '100%',
    css: "cell-ellipsis",
    inserting: false,
    editing: false,
    sorting: true,
    paging: false,
    filtering: false,
    autoload: true,
    controller: {
      loadData: function (data) {
        return data;
      }
    },
    fields: [
      {name: 'id', title: 'ID', type: 'number', sorter: "number", width: 50, align: "center"},
      {name: 'email', title: 'User', type: 'text', width: 100, align: "center"},
      {name: 'createdDt', title: 'Date', type: 'date', width: 70, align: "center"},
      {name: 'createdTime', title: 'Time', type: 'date', width: 70, align: "center"},
      {name: 'voiceQueryVS', title: 'Voice Query Text', width: 200, type: 'text', align: "left"},
      {name: 'voiceParsedQueryVS', title: 'Parsing Result', type: 'text', width: 200, align: "left"}
    ]
  });
};

var getRowGridOverallStat = function (data) {
  if (!data.length) return;

  var result = [],
    dataOverallStat = {
      period: 'all',
      totalReq: 0,
      totalSuccesses: 0,
      totalFailures: 0,
      avgMondee: 0,
      avgTime: 0
    };

  var all = $.extend({}, dataOverallStat, {period: 'all'}),
    daily = $.extend({}, dataOverallStat, {period: 'daily'}),
    weekly = $.extend({}, dataOverallStat, {period: 'weekly'}),
    monthly = $.extend({}, dataOverallStat, {period: 'monthly'}),
    timeWorkCnt = 0, timeWorkVal = 0, timeWorkProvCnt = 0, timeWorkProvVal = 0,
    tmWorkCnt_d = 0, tmWorkVal_d = 0, tmWorkProvCnt_d = 0, tmWorkProvVal_d = 0,
    tmWorkCnt_w = 0, tmWorkVal_w = 0, tmWorkProvCnt_w = 0, tmWorkProvVal_w = 0,
    tmWorkCnt_m = 0, tmWorkVal_m = 0, tmWorkProvCnt_m = 0, tmWorkProvVal_m = 0,
    nowDT = Date.now(),
    dailyDT = nowDT - 1000 * 60 * 60 * 24,
    weeklyDT = nowDT - 1000 * 60 * 60 * 24 * 7,
    monthlyDT = nowDT - 1000 * 60 * 60 * 24 * 30;
  data.forEach(function (item) {
    var currDT = new Date(item.createdAt).getTime();
    all.totalReq++;
    if (currDT >= dailyDT) {
      daily.totalReq++;
    }
    if (currDT >= weeklyDT) {
      weekly.totalReq++;
    }
    if (currDT >= monthlyDT) {
      monthly.totalReq++;
    }
    if (typeof item.logInfo.countAll != 'undefined') {
      if (!item.logInfo.error) {
        all.totalSuccesses++;
        if (currDT >= dailyDT) {
          daily.totalSuccesses++;
        }
        if (currDT >= weeklyDT) {
          weekly.totalSuccesses++;
        }
        if (currDT >= monthlyDT) {
          monthly.totalSuccesses++;
        }
      } else {
        all.totalFailures++;
        if (currDT >= dailyDT) {
          daily.totalFailures++;
        }
        if (currDT >= weeklyDT) {
          weekly.totalFailures++;
        }
        if (currDT >= monthlyDT) {
          monthly.totalFailures++;
        }
      }
    }
    if (item.logInfo.searchInfoByProviders && item.logInfo.searchInfoByProviders.length) {
      item.logInfo.searchInfoByProviders.map(function (it) {
        if (it.name == 'mondee' && it.time) {
          timeWorkProvCnt++;
          timeWorkProvVal += parseInt(it.time);
          if (currDT >= dailyDT) {
            tmWorkProvCnt_d++;
            tmWorkProvVal_d += parseInt(it.time);
          }
          if (currDT >= weeklyDT) {
            tmWorkProvCnt_w++;
            tmWorkProvVal_w += parseInt(it.time);
          }
          if (currDT >= monthlyDT) {
            tmWorkProvCnt_m++;
            tmWorkProvVal_m += parseInt(it.time);
          }
        }
      });
    }
    if (item.logInfo.timeWork) {
      timeWorkCnt++;
      timeWorkVal += parseInt(item.logInfo.timeWork);
      if (currDT >= dailyDT) {
        tmWorkCnt_d++;
        tmWorkVal_d += parseInt(item.logInfo.timeWork);
      }
      if (currDT >= weeklyDT) {
        tmWorkCnt_w++;
        tmWorkVal_w += parseInt(item.logInfo.timeWork);
      }
      if (currDT >= monthlyDT) {
        tmWorkCnt_m++;
        tmWorkVal_m += parseInt(item.logInfo.timeWork);
      }
    }
  });

  if (timeWorkProvCnt && timeWorkProvVal) {
    all.avgMondee = durationHr(parseInt(timeWorkProvVal / timeWorkProvCnt));
  }
  if (tmWorkProvCnt_d && tmWorkProvVal_d) {
    daily.avgMondee = durationHr(parseInt(tmWorkProvVal_d / tmWorkProvCnt_d));
  }
  if (tmWorkProvCnt_w && tmWorkProvVal_w) {
    weekly.avgMondee = durationHr(parseInt(tmWorkProvVal_w / tmWorkProvCnt_w));
  }
  if (tmWorkProvCnt_m && tmWorkProvVal_m) {
    monthly.avgMondee = durationHr(parseInt(tmWorkProvVal_m / tmWorkProvCnt_m));
  }

  if (timeWorkCnt && timeWorkVal) {
    all.avgTime = durationHr(parseInt(timeWorkVal / timeWorkCnt));
  }
  if (tmWorkCnt_d && tmWorkVal_d) {
    daily.avgTime = durationHr(parseInt(tmWorkVal_d / tmWorkCnt_d));
  }
  if (tmWorkCnt_w && tmWorkVal_w) {
    weekly.avgTime = durationHr(parseInt(tmWorkVal_w / tmWorkCnt_w));
  }
  if (tmWorkCnt_m && tmWorkVal_m) {
    monthly.avgTime = durationHr(parseInt(tmWorkVal_m / tmWorkCnt_m));
  }

  result.push(daily, weekly, monthly/*, all*/);

  return result;
};


var genGridVanityURLs = function () {
  var isValidURL = function(value){
    return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(value);     
  };

  var preapareHost = function(host){
    host = host.trim();
    if(host.length > 0 && host.substr(-1) !== '/') host += '/';
    return host;    
  };


  $('#gridVanityURLsAddNew').off('click').on('click', function(){
    $($('#gridVanityURLsHostname').parents('.form-group').get(0)).removeClass('has-error');
    
    if($('#gridVanityURLsUseHostname').is(':checked') && !isValidURL($('#gridVanityURLsHostname').val())){
      $($('#gridVanityURLsHostname').parents('.form-group').get(0)).addClass('has-error');
      return false;
    }
    
    var insertTemplate = function() {
      var input = this.__proto__.insertTemplate.call(this);
      input.val('');
      if($('#gridVanityURLsUseHostname').is(':checked')){
        input.val(preapareHost($('#gridVanityURLsHostname').val()));
      }
      return input;
    };            
    
    var grid = $('#gridVanityURLs .grid');
    grid.jsGrid('fieldOption', 'vanity_url', 'insertTemplate', insertTemplate);
    grid.jsGrid('fieldOption', 'destination_url', 'insertTemplate', insertTemplate);    
    grid.jsGrid('option', 'inserting', true);
    
    $(this).addClass('hidden');
    $('#gridVanityURLsCancel').removeClass('hidden');
  });
  
  $('#gridVanityURLsCancel').off('click').on('click', function(){
    $('#gridVanityURLs .grid').jsGrid('option', 'inserting', false);
    $(this).addClass('hidden');
    $('#gridVanityURLsAddNew').removeClass('hidden');
  });

  var showError = function(error){
    $('#gridVanityURLsErrorMessage .panel-body').html(error);
    $('#gridVanityURLsErrorMessage').removeClass('hidden');
  }

  var grid = $('#gridVanityURLs .grid').jsGrid('destroy').jsGrid({
    height: '550px',
    width: '100%',
    css: 'cell-ellipsis',
    
    inserting: false,
    editing: true,
    deleting: true,
    sorting: true,
    paging: false,
    filtering: false,
    autoload: true,
 
    controller: {
      loadData: function(data)
      {
        return data;
      },
      insertItem: function(item)
      {
        var d = $.Deferred();
        item.vanity_url = item.vanity_url.replace(/\/+$/, '');
        socketAbo.post('/vanityURLs/create/', item, function(res, jwres){
          if(res.error){
            showError(JSON.stringify(res.error));
            console.log(res.error);
            d.reject();
          }else{
            item.id = jwres.body.data.id;
            d.resolve();
          }
        });
        return d.promise();
      },      
      updateItem: function(item)
      {
        var d = $.Deferred();      
        item.vanity_url = item.vanity_url.replace(/\/+$/, '');
        socketAbo.post('/vanityURLs/edit/'+item.id+'/', item, function(res, jwres){
          if(res.error){
            showError(JSON.stringify(res.error));
            console.log(res.error);
            d.reject();
          }else{
            d.resolve();
          }
        });
        return d.promise();          
      },
      deleteItem: function(item)
      {
        var d = $.Deferred();         
        socketAbo.post('/vanityURLs/delete/'+item.id+'/', {}, function(res, jwres){
          if(res.error){
            showError(JSON.stringify(res.error));
            console.log(res.error);
            d.reject();
          }else{
            d.resolve();
          }
        });
        return d.promise();                
      },      
    },
    fields: [
      { name: 'id', css: 'hidden', width: 0 },
      { name: 'vanity_url', title: 'Vanity URL', type: 'text', width: 300, align: 'left',
        validate: { message: 'Invalid Vanity URL', validator: isValidURL }     
      },
      { name: 'destination_url', title: 'Destination URL', type: 'text', width: 300, align: 'left',
        validate: { message: 'Invalid Destination URL', validator: isValidURL }         
      },
      { type: 'control' }
    ]
  });


  socketAbo.get('/vanityURLs/read/', {}, function(res, jwres){
    if(res.data){
      $('#gridVanityURLs .grid').jsGrid('loadData', res.data);      
    }
  });      
};