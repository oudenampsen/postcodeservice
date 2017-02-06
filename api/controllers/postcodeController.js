'use strict';

var util = require('util');
var checker = require('../helpers/pc_checker');

module.exports = {
  check: check
};

function check(req, res) {
  // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
  var zipcode = req.swagger.params.zipcode.value.toUpperCase().replace(/\s/g, '');
  var housenumber = req.swagger.params.housenumber.value;

  var address = checker.find(zipcode, housenumber, function(err, response){
    var result = {};
    result.request = {"zipcode": zipcode, "housenumber": housenumber};
    if (response){
      result.response  = response;
      console.log(result);
      res.json(response);
    } else {
      res.statusCode = 404;
      var s = util.format('Zipcode %s with housenumber %s not found', zipcode, housenumber);
      var errorResponse = {message: s};
      result.response  = errorResponse;
      console.log(response);
      res.json(errorResponse);
    }
    console.log('>>>>>' + res._headers['x-response-time']);

  });

}
