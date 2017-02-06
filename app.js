/*jslint node: true */
'use strict';

var SwaggerExpress = require('swagger-express-mw');
var SwaggerUi = require('swagger-tools/middleware/swagger-ui');
var app = require('express')();
module.exports = app; // for testing

// response time stats (X-Response-time header) toevoegen
var responseTime = require('response-time');
app.use(responseTime());

var config = {
  appRoot: __dirname // required config
};

SwaggerExpress.create(config, function(err, swaggerExpress) {
    if (err) { throw err; }

    // add swagger UI
    app.use( new SwaggerUi(swaggerExpress.runner.swagger));

    // install middleware
    swaggerExpress.register(app);

    var port = parseInt(process.env.PORT) || 8080;
    app.listen(port);

    if (swaggerExpress.runner.swagger.paths['/ping']) {
        console.log('try this:\ncurl http://127.0.0.1:' + port + '/ping');
    }

});