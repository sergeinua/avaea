
let qpromice = require('q');

let procUserPrograms = (dataRec) => {
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
};

let readEticketQueueCounter = 0;

module.exports = {

  execReadEticket: function () {
    // sails.log.warn('I am triggering when time is come: '+ new Date().toLocaleString());
    sails.log.verbose('Start execReadEticket job');
    if (readEticketQueueCounter > 0) {
      sails.log.warn(`readEticket queue did not spooled by previous job. Queue counter=${readEticketQueueCounter}. Stop current job`);
      return;
    }
    readEticketQueueCounter = 1; // Up queue flag for concurrent jobs

    // Booking.find(
    //   {
    //     status_eticket: 1,
    //     createdAt: {'>=': sails.moment().subtract(sails.config.flightapis.execReadEticketPeriod, 'seconds').format('YYYY-MM-DD HH:mm:ss')}
    //   })
    //   .then(function (records){
    //     if (records.length == 0) {
    //       return Promise.reject(false); // break chain wo error
    //     }
    //
    //     for (let ii=0; ii < records.length; ii++) {
    //       sails.log.warn('__rec:', records[ii]);
    //     }
    //   })
    //   .catch(function (error) {
    //     if (error) {
    //       sails.log.error(error);
    //     }
    //   });

    let eticketNumbersStore = {};
    qpromice.nfbind(Booking.query)(
      'SELECT b.*, u.email FROM booking b, "user" u WHERE b.user_id=u.id AND b.status_eticket=1 AND b."createdAt" >= $1 ORDER BY b.id',
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

              return qpromice.all(procUserPrograms(_cur_rec));
            })

            .then(function (programsResults) {
              let _programs_res = Object.assign(...programsResults);
              // E-mail notification
              let tpl_vars = {
                reqParams: _cur_rec.req_params,
                order: _cur_rec.itinerary_data,
                bookingRes: {PNR : _cur_rec.pnr, ReferenceNumber: _cur_rec.reference_number},
                replyTo: sails.config.email.replyTo,
                callTo: sails.config.email.callTo,
                miles: _programs_res.miles,
                refundType: _programs_res.refundType,
                eticketNumber: eticketNumbersStore[ii],
              };
              return Mailer.makeMailTemplate(sails.config.email.tpl_ticket_confirm, tpl_vars);
            })

            .then(function (msgContent) {
              return Mailer.sendMail({to: _cur_rec.email, subject: 'Booking with ETicket number '+eticketNumbersStore[ii]}, msgContent);
            })

            .then(function () {
              sails.log.info('Mail was sent to '+ _cur_rec.email);
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