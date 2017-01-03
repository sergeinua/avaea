
let qpromice = require('q');

let readEticketQueueCounter = 0;

module.exports = {

  procUserPrograms: (dataRec) => {
    // Returns array of fulfilled promises only - wo rejected. Else you must to parse by allSettled() in the parent caller
    return [
      qpromice.nfbind(ffmapi.milefy.Calculate)(dataRec.itinerary_data)
        .then(function (body) {
          let jdata = (typeof body == 'object') ? body : JSON.parse(body);
          return Promise.resolve({
            miles: {name: jdata.ProgramCodeName || '', value: jdata.miles || 0}
          });
        })
        .catch(function () {
          return Promise.resolve({
            miles: {name: '', value: 0}
          });
        }),

      qpromice.nfbind(Search.getRefundType)(dataRec.itinerary_data)
        .then(function (response) {
          return Promise.resolve({refundType: response});
        })
        .catch(function () {
          return Promise.resolve({refundType: ''});
        })
    ];
  },

  execReadEticket: function () {
    sails.log.verbose('Start execReadEticket job');
    if (readEticketQueueCounter > 0) {
      sails.log.warn(`readEticket queue did not spooled by previous job. Queue counter=${readEticketQueueCounter}. Stop current job`);
      return;
    }
    readEticketQueueCounter = 1; // Up queue flag for concurrent jobs
    let _self = this;

    let eticketNumbersStore = {};
    qpromice.nfbind(Booking.query)(
      `SELECT b.*, u.email FROM ${Booking.tableName} b, "${User.tableName}" u WHERE b.user_id=u.id AND b.status_eticket=1 AND b."createdAt" >= $1 ORDER BY b.id`,
      [sails.moment().subtract(sails.config.flightapis.execReadEticketPeriod, 'seconds').format('YYYY-MM-DD HH:mm:ss')]
    )
      .then(function (dbResults) {
        if ((readEticketQueueCounter = dbResults.rows.length) == 0) {
          return Promise.reject(false); // break chain wo error
        }

        for (let ii=0; ii < dbResults.rows.length; ii++) {
          let _cur_rec = dbResults.rows[ii];
          if (!_cur_rec.itinerary_data || !_cur_rec.itinerary_data.service || typeof global[_cur_rec.itinerary_data.service].readEticket != 'function') {
            continue;
          }

          qpromice.nfbind(global[_cur_rec.itinerary_data.service].readEticket)(
            Search.getCurrentSearchGuid() +'-'+ _cur_rec.itinerary_data.service,
            {pnr: _cur_rec.pnr, reference_number: _cur_rec.reference_number}
          )
            .then(function (eticketNumber) {
              if (!eticketNumber) {
                return Promise.reject('Empty ETicketNumber');
              }
              eticketNumbersStore[ii] = eticketNumber; // remember

              return qpromice.all(_self.procUserPrograms(_cur_rec));
            })

            .then(function (programsResults) {
              let _programs_res = Object.assign(...programsResults);
              // E-mail notification
              let tpl_vars = {
                mailType: 'eticket',
                reqParams: _cur_rec.req_params,
                order: _cur_rec.itinerary_data,
                bookingRes: {PNR : _cur_rec.pnr, ReferenceNumber: _cur_rec.reference_number},
                replyTo: sails.config.email.replyTo,
                callTo: sails.config.email.callTo,
                miles: _programs_res.miles,
                refundType: _programs_res.refundType,
                eticketNumber: eticketNumbersStore[ii],
                serviceClass: Search.serviceClass,
                providerInfo: sails.config.flightapis[_cur_rec.itinerary_data.service].providerInfo
              };
              segmentio.track(_cur_rec.user_id, 'Confirmation for the E-Ticket number', {params: tpl_vars});
              return Mailer.makeMailTemplate(sails.config.email.tpl_ticket_confirm, tpl_vars);
            })

            .then(function (msgContent) {
              return Mailer.sendMail({to: _cur_rec.email, subject: 'eTicket for order '+ _cur_rec.pnr}, msgContent);
            })

            .then(function () {
              sails.log.info('Mail with e-ticket confirmation was sent to '+ _cur_rec.email);
              return Booking.update(
                {id: _cur_rec.id},
                {
                  eticket_number: eticketNumbersStore[ii],
                  status_eticket: 2
                }
              );
            })

            .then(function () {
              return Promise.reject(false); // the end
            })

            .catch(function (error) {
              if (error) {
                sails.log.error('in readEticket chain:', error);
              }
              readEticketQueueCounter = (ii == readEticketQueueCounter-1) ? 0 : readEticketQueueCounter - 1;
            });
        }
      })

      .catch(function (error) {
        if (error) {
          sails.log.error('in Booking query chain:', error);
        } else {
          sails.log.verbose('Nothing to readEticket');
        }
        readEticketQueueCounter = 0;
      });
  },

};
