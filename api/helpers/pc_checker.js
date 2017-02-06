// 'use strict';

var mongoClient = require('mongodb').MongoClient;
var assert = require('assert');

var url = 'mongodb://localhost:27017/postcodes_cendris';
var countryCodeNL = 'NL';

module.exports = {
  find: find
};

function find(zipcode, housenumber, callback) {
  var ihousenumber = parseInt(housenumber);
  mongoClient.connect(url, function(err, db) {
    var cursor = db.collection('postcodes').find({'postcode': zipcode});
    var pcranges = [];
    cursor.each(function(err, doc) {
      if (!doc) {
        var address = {};
        pcranges.forEach(function(pcrange){
          if ((pcrange.min_number <= ihousenumber) &&
          (ihousenumber <= pcrange.max_number) &&
          ((oddOrEven(ihousenumber) == pcrange.number_type))){ // == '' is voor postbussen
             address.street = pcrange.street;
             address.housenumber = housenumber;
             address.zipcode = pcrange.postcode;
             address.city = pcrange.city;
            //  address.provincie = pcrange.state;
          }
        });
        db.close();
        if (address.street){
          callback(null, {street: address.street, housenumber: housenumber, zipcode: address.zipcode, city:address.city, countryCode: countryCodeNL});
        }
        else{
          callback('range fail',null);
        }
      } else {
          // console.log(doc);
          pcranges.push(doc);
      }
    });

  });

}

function oddOrEven(x) {
  return ( x & 1 ) ? "odd" : "even";
}
