// =================================================================
// get the packages we need ========================================
// =================================================================
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongojs = require('mongojs');

var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config'); // get our config file

// =================================================================
// configuration ===================================================
// =================================================================
var port = process.env.PORT || 8088; // used to create, sign, and verify tokens
var db = mongojs(config.database); // connect to database
app.set('superSecret', config.secret); // secret variable

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// =================================================================
// routes ==========================================================
// =================================================================

// basic route 
app.get('/', function (req, res) {    
    res.sendStatus(404)
});

// ---------------------------------------------------------
// get an instance of the router for api routes
// ---------------------------------------------------------
var apiRoutes = express.Router();

// ---------------------------------------------------------
// route middleware to authenticate and check token
// ---------------------------------------------------------
apiRoutes.use(function (req, res, next) {

    // check header or url parameters or post parameters for token
    var token = req.body.token || req.params.token || req.headers['x-access-token'];

    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log("Request IP: ", ip);
    if (config.ipaddress.indexOf(ip) > -1) {
        console.log("IP Valid: ", ip);

        // decode token
        if (token) {
            console.log("Token Valid");
            // verifies secret and checks exp
            jwt.verify(token, app.get('superSecret'), function (err, decoded) {
                if (err) {
                    return res.json({ success: false, message: 'Failed to authenticate token.' });
                } else {
                    // if everything is good, save to request for use in other routes
                    req.decoded = decoded;
                    next();
                }
            });

        } else {
            console.log("Token InValid");
            // if there is no token
            // return an error
            return res.status(403).send({
                success: false,
                message: 'No token provided.'
            });

        }
    } else {
        console.log("IP InValid: ", ip);
        return res.status(403).send({
            success: false,
            message: 'Request Forbidden: Invalid IP-Address - ' + ip
        });
    }


});

// ---------------------------------------------------------
// authenticated routes
// ---------------------------------------------------------
apiRoutes.get('/', function (req, res) {
    res.json({ message: 'Welcome to Apayaa Public API portal. Kindly use the provided API path !' });
});

apiRoutes.get('/realtime/status', function (req, res) {
    db.realtime_status.find(function (err, docs) {
        if (err) console.log(err);
        if (docs) {
            console.log("DATA: ", docs);
            res.json(docs);
        }
    })
});

apiRoutes.get('/check', function (req, res) {
    res.json(req.decoded);
});

app.use('/api', apiRoutes);

// =================================================================
// start the server ================================================
// =================================================================
app.listen(port);
console.log('AHS Apayaa Public API Portal running on port:' + port);


// mongodb events
db.on('error', function (err) {
    console.log('mongodb database error', err)
});
db.on('connect', function () {
    console.log('mongodb database connected')
});