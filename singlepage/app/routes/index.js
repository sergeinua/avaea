/**
 * @param app
 *
 * @description
 * Routs
 *
 */

module.exports = function(app) {

    app.post('/api/farelogix/air', require('./farelogix').air);
    app.post('/api/farelogix/price', require('./farelogix').price);


    app.get('/', function(req, res) {
        res.sendfile('index.html');
    });

};