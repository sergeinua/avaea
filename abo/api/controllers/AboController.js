/* global UserAction */
/* global User */
/* global tPrediction */
/* global sails */
/**
 * AboController
 *
 * @description :: Server-side logic for admin page
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var qpromise = require('q'),
    moment = require('moment'),
    util = require('util'),
    xl = require('excel4node');

module.exports = {
  index: function (req, res) {

    var selectedAirline = '';

    if (req.params.selectedAirline && req.params.selectedAirline.length == 2 ) {
      selectedAirline = req.params.selectedAirline.toUpperCase();
      console.log('selectedAirline in params: ' + selectedAirline);
    }

    User.find({}).exec(function (err, found) {
      if (!err && found.length) {
        return res.view('admin/index', {
            selectedAirline: selectedAirline,
            users: found,
            layout: 'admin'
          });
      } else {
        return res.json([]);
      }
    });
  },
  getActionByType: function (req, res) {
    UserAction.find({
      where: {
        id: {'>':req.param('lastUpdated', 0)},
        actionType: req.param('actionType', 'search'),
        createdAt: {'>=' : new Date(_.now() - 1000 * 60 * 60 * 24 * 31).toISOString()}
      },
      sort : 'id DESC'
    }).populate('user_id').exec(function (err, found) {
      if (!err && found.length) {
        return res.json(found);
      } else {
        return res.json([]);
      }
    });
  },
  getaction: function (req, res) {
    UserAction.find({
      where: {id: {'>':req.param('lastUpdated', 0)}},
      sort : 'id ASC'
    }).exec(function (err, found) {
      if (!err && found.length) {
        return res.json({
            userActions: _.takeRight(found,10)
          });
      } else {
        return res.json({
            userActions:[]
          });
      }
    });
  },
  getByUser: function (req, res) {
    var userId = req.param('user_id', 0);
    if (!userId) {
      sails.log.error('Cant find user');
      return res.json({
        userActions:[]
      });
    }
    UserAction.find({
      where:{
        id: {
          '>': req.param('lastUpdated', 0)
        },
        user_id: userId
      },
      sort : 'id ASC'
    }).exec(function (err, found) {
      if (!err && found.length) {
        return res.json({
            userActions: _.takeRight(found, 30)
          });
      } else {
        return res.json({
            userActions:[{
              actionType: 'empty',
              user_id: userId,
              createdAt: 0,
              id: 0,
              logInfo: {error: 'Cant find actions data for user id #' + userId}
            }]
          });
      }
    });
  },
  getTilesByUser: function (req, res) {
    var userId = req.param('user_id', 0);

    if (!userId) {
      sails.log.error('Cant find user id ', userId);
      return res.json({
        data:{error:'user not found'}
      });
    }
    var serviceClass = [
      'E',//'Economy',
      'P',//'Premium',
      'B',//'Business',
      'F' //'First'
    ];
    var data = [];

    async.parallel([
        function (callback) {
            tPrediction.getUserTilesCb(userId, 'E', callback);
        },
        function (callback) {
            tPrediction.getUserTilesCb(userId, 'P', callback);
        },
        function (callback) {
            tPrediction.getUserTilesCb(userId, 'B', callback);
        },
        function (callback) {
            tPrediction.getUserTilesCb(userId, 'F', callback);
        }
    ], function(err, result) {
      //sails.log.info("__getTilesByUser:", require('util').inspect(result, {showHidden: true, depth: null})); // dev debug
        data = tPrediction.adminTiles;
        return res.json({
          data: result
        });
    });
  },
  getTransactions: function(req, res) {

    let dateStart = moment(req.param('dateStart', ''), 'MM/DD/YYYY'),
        dateEnd = moment(req.param('dateEnd', ''), 'MM/DD/YYYY');

    if(dateStart === 'Invalid date' || dateEnd === 'Invalid date'){
      return res.json({error: 'Invalid date'});
    }
    dateEnd = dateEnd.add(60*24-1, 'm');

    // create criteria for booking request
    let data = {
          rows: [],
          criteria: {
            where: { updatedAt: { '>=': dateStart.toDate(), '<=': dateEnd.toDate() } },
            sort: 'updatedAt ASC'
          }
        };

    let getBooking = function(data){
      let deferred = qpromise.defer();
      Booking.find(data.criteria).populate('user_id').exec(function(error, result) {
        if (error) {
          deferred.reject(error);
        }else{
          data.rows = result;
          deferred.resolve(data);
        }
      });
      return deferred.promise;
    };

    return getBooking(data).then(function(data){
      let transactions = [];

      for(var i in data.rows){
        let booking = data.rows[i];
        let itinerary = booking.itinerary_data || {};
        let request = booking.req_params || {};
        let user = booking.user_id || {};

        transactions.push(
          {
            // + Date Transaction processed - booking.updateAt datetime field,
            A: moment(booking.updatedAt).format('MM/DD/YYYY'),
            // + Transaction Id - booking record id (booking.id),
            B: booking.id,
            // - SKU,
            C: 'Air fare',
            // + Customer Id - onvoya user id (booking.user_id),
            D: user.id,
            // + PNR - booking PNR field (booking.pnr),
            E: booking.pnr,
            // + Provider - get from booking.intinerary_data field, key "service",
            F: itinerary.service || '',
            // + Currency - get from booking.intinerary_data field, key "currency",
            G: itinerary.currency || '',
            // - BaseFare - booking.itinerary_data, key "fare"
            H: parseFloat(itinerary.fare || '0.00').toFixed(2),
            // - Taxes - booking.itinerary_data, key "taxes"
            J: parseFloat(itinerary.taxes || '0.00').toFixed(2),
            // - Total - booking.itinerary_data, key "price"
            K: parseFloat(itinerary.price || '0.00').toFixed(2),
            // - TransactionStatus,
            L: (booking.status_eticket === 2)? 'eticket': '',
            // - Method of Payment (CardType) - get value from the booking request,
            M: request.CardType,
            // - TaxCountry - get value from the booking request,
            N: request.Country,
            // TaxCity - get value from the booking request,
            O: request.City,
            // TaxZip - get value from the booking request,
            P: request.ZipCode,
            // Device: '',
            Q: request.deviceType || '',
            // Referrer: '',
            R: user.landing_page || ''
          }
        );
      }

      let xlsxFileName = req.param('xlsx', '');

      if(!xlsxFileName){
        return res.json({ error: '', data: { rows: transactions } });
      }else{

        // header of excel spreadsheet
        let cols = [
          { title: 'Date', type: 'date' },
          { title: 'Transaction ID', type: 'string' },
          { title: 'SKU', type: 'string' },
          { title: 'Customer', type: 'string' },
          { title: 'PNR', type: 'string' },
          { title: 'Provider', type: 'string' },
          { title: 'Currency', type: 'string' },
          { title: 'Base Fare, $', type: 'number' },
          { title: 'Taxes & Fees, $', type: 'number' },
          { title: 'Total, $', type: 'number' },
          { title: 'Status', type: 'string' },
          { title: 'Method of Payment', type: 'string' },
          { title: 'Tax Country', type: 'string' },
          { title: 'Tax City', type: 'string' },
          { title: 'Tax Zip', type: 'string' },
          { title: 'Device', type: 'string' },
          { title: 'Referrer', type: 'string' }
        ];

        let rows = [];
        for(var i in transactions){
          let row = [];
          for(var j in transactions[i]){
            row.push(transactions[i][j]);
          }
          rows.push(row);
        }

        // create workbook
        let wb = new xl.Workbook(
          {
              jszip: {
                  compression: 'DEFLATE'
              },
              defaultFont: {
                  size: 9,
                  name: 'Calibri',
                  color: '000000'
              },
              dateFormat: 'm/d/yy hh:mm:ss',
              numberFormat: '$#,##0.00; ($#,##0.00); -'
          }
        ); // create workbook
        let ws = wb.addWorksheet('report'); // add Worksheets to the workbook
        let style = wb.createStyle({ // create a reusable style
          font: {
            color: '#000000',
          },
          numberFormat: '$#,##0.00; ($#,##0.00); -'
        });

        ws.cell(1,1)
          .string('Transactions Report from '+moment(dateStart).format('MM/DD/YYYY')+' to '+moment(dateEnd).format('MM/DD/YYYY'))
          .style({font:{size: 12}});

        let styleHeader = wb.createStyle({
          alignment: {
            horizontal: ['center'],
            vertical: ['center'],
            wrapText: true,
          },
          font: {
            size: 9,
            bold: true
          },
          border:{
            left:   { style: 'thin', color: '#000000' },
            right:  { style: 'thin', color: '#000000' },
            top:    { style: 'thin', color: '#000000' },
            bottom: { style: 'thin', color: '#000000' }
          }
        });

        let r = 3, c = 1; // rows, cells counters
        for(let i in cols){
          ws.cell(r, c).string(''+cols[i].title).style(styleHeader);
          c ++;
        }
        r ++;

        let styleBody = wb.createStyle({
          alignment: {
            horizontal: ['center'],
            vertical: ['center'],
            wrapText: true
          },
          font: {
            size: 8,
            bold: false
          },
          border:{
            left:   { style: 'thin', color: '#000000' },
            right:  { style: 'thin', color: '#000000' },
            top:    { style: 'thin', color: '#000000' },
            bottom: { style: 'thin', color: '#000000' }
          }
        });

        style.font.bold = false; // remove bold option of font
        for(let i in rows){
          let c = 1; // cols counter
          for(var j in rows[i]){
            let v = ''+(rows[i][j] || ''); // value of cell
            ws.cell(r, c).string(v).style(styleBody);
            c ++;
          }
          r ++;
        }

        // output as binary file
        res.set({
          'Content-Disposition': 'attachment;filename='+xlsxFileName,
          'Content-type': 'application/octet-stream'
        });
        wb.writeToBuffer().then(
          function(buffer){
            res.send(buffer);
          },
          function(error){
            res.json({error: 'Error occured. XLSX report can not be create.'});
          }
        );
      }
    })
    .catch(function (error) {
      sails.log.error(error);
      return res.json({error: error});
    })
    .done();
  },
};
