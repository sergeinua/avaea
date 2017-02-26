var dbm = global.dbm || require('db-migrate');
var type = dbm.dataType;


function updateUseractions(db) {

}

exports.up = function(db, callback) {
    db.runSql(`
        select
          t.*,
          a.iata_2code
        from (
          select
            f.id,
            json_array_elements(f.log->'filters') as airlines,
            f."logInfo"
          from (
            select
              l.*
            from (
              select
                ua.id,
                json_array_elements(ua."logInfo") as log,
                ua."logInfo"
              from
                useraction as ua
              where
                ua."actionType" = 'order_tiles'
            ) as l
            where
              l.log->>'name' = 'Airline'
          ) as f
        ) as t
        left join airlines as a on a.name = t.airlines->>'title' and a.iata_2code != ''`, function(err, result) {

        let activeId = 0;
        let logInfo = [];
        let filters = [];
        let lineChanged = false;
        let invalidId = false;

        for (let row in result.rows) {
            let line = result.rows[row];

            if (line.id !== activeId) {

                if (!invalidId && lineChanged) {
                    commitLine(activeId, logInfo);
                }

                activeId = line.id;
                logInfo = line.logInfo;
                lineChanged = false;
                invalidId = false;
                filters = [];

                const index = logInfo.findIndex((item, id) => item.name === 'Airline');
                if (index === -1){
                    console.log('Invalid filter. There are no Airline filter');
                    invalidId = true;
                    continue;
                }

                logInfo[index].filters = filters;
            }

            if (line.airlines) {
                line.airlines.iata_2code = line.iata_2code;
                filters.push(line.airlines);
                lineChanged = true;
            }
        }

        if (result.rowCount && !invalidId && lineChanged) {
            commitLine(activeId, logInfo);
        }

        callback();
    });

    function commitLine(id, logInfo) {
        db.runSql(`begin; update useraction set "logInfo"='${JSON.stringify(logInfo)}' where id = '${id}'; commit;`);
    }
};

exports.down = function(db, callback) {
    callback();
};
