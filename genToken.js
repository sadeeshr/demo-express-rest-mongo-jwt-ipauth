var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config'); // get our config file

// create a token
var payload = {
    user: "accesshealthcare"
}
var token = jwt.sign(payload, config.secret);

console.log({
    success: true,
    message: 'Secure Token!',
    token: token
});
