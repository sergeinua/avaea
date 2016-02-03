var express        = require('express'),
    app            = express(),
    config         = require('./config/config'),
    bodyParser     = require('body-parser'),
    methodOverride = require('method-override'),
    cookieParser   = require('cookie-parser'),
    //mysql          = require('mysql'),
    pg             = require('pg'),
    //session        = require('express-session'),
    //SessionStore   = require('connect-pg-simple')(session),
    //SessionStore   = require('express-mysql-session'),
    //connection     = require('express-myconnection'),
    log            = require('./app/lib/log')(module),
    http           = require('http'),
    https          = require('https'),
    fs             = require('fs');

var connectionString =
    "pg://" + config.get('dbOptions:user') +":" + config.get('dbOptions:password') + "@" + config.get('dbOptions:host') + "/" + config.get('dbOptions:database'),
    connection = pg.connect(connectionString, function() {});

console.log(connectionString);
//app.use(connection(pg, config.get('dbOptions'), 'single'));
//app.use(session({
//    saveUninitialized : config.get('session:saveUninitialized'),
//    secret            : config.get('session:secret'),
//    resave            : config.get('session:resave'),
//    cookie            : config.get('session:cookie'),
//    store             : new SessionStore({
//                            pg : pg,                                  // Use global pg-module
//                            conString : config.get('dbOptions:host'), // Connect using something else than default DATABASE_URL env variable
//                            tableName : 'user_sessions'               // Use another table-name than the default "session" one
//                        }),
//    rolling           : config.get('session:rolling')
//}));

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ 'extended' : 'true' }));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(cookieParser());

//app.use(require('./app/middleware/checkAuth'));
//app.use(require('./app/middleware/setUser'));
//app.use(require('./app/middleware/checkRights'));

require('./app/routes/index.js')(app);

app.use(function(err, req, res, next) {

    if (typeof err == 'number') {

        log.error({ error : "An error occurred.", status : err });
        res.status(err).json({ error : "An error occurred." });

    } else {

        if (app.get('env') == 'development') {

            log.error(err);

            if(err.status) {
                res.status(err.status).json(err);
            } else {
                res.status(503).json(err);
            }

        } else {
            log.error(err);
            res.status(500).json(err);
        }

    }

});

app.listenHttp = function() {
    var server = http.createServer(this);
    return server.listen.apply(server, arguments);
};

app.listenHttp(config.get('httpPort'), function() {
    log.info("Server listening on port " + config.get('httpPort'));
});