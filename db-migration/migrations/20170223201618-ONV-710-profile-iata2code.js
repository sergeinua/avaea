var dbm = global.dbm || require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
    function commitLine(id, preferredAirlines) {
        db.runSql(`begin; update profile set preferred_airlines='${JSON.stringify(preferredAirlines)}' where id = '${id}'; commit;`);
    }

    db.runSql(`select p.id, p.pa, a.iata_2code from (
        select id, json_array_elements(preferred_airlines) as pa from profile
        ) as p
        left join airlines as a on a.name = p.pa->>'airline_name'
        order by p.id`, function(err, result) {

        let activeId = 0;
        let airlines = [];
        let lineChanged = false;

        for (let row in result.rows) {
            let line = result.rows[row];

            if (line.id !== activeId) {

                if (lineChanged) {
                    commitLine(activeId, airlines);
                }

                activeId = line.id;
                airlines = [];
                lineChanged = false;
            }

            if (line.iata_2code) {
                line.pa.airline_iata_2code = line.iata_2code;
                lineChanged = true;
            }
            airlines.push(line.pa);
        }

        if (result.rowCount && lineChanged) {
            commitLine(activeId, airlines);
        }
        callback();
    });
};

exports.down = function(db, callback) {
    callback();
};
