module.exports = {
  importCendris: importCendris
};

var mongoClient = require('mongodb').MongoClient;
var objectID = require('mongodb').ObjectID;
var assert = require('assert');
var url = 'mongodb://localhost:27017/postcodes_cendris';
var collectionName = "postcodes";

var fs        = require('fs'),
    readline  = require('readline');

var offset = 201; // 0;

var POS_POSTCODE_NUM  = {pos: 0, size: 4};
var POS_POSTCODE_ALF  = {pos: 4, size: 2};
var POS_POSTCODE_TYPE = {pos: 6, size: 1};
var POS_MIN_NUMBER    = {pos: 7, size: 5};
var POS_MAX_NUMBER    = {pos: 12, size: 5};
var POS_STREET        = {pos: 100, size: 43};
var POS_CITY          = {pos: 35, size: 24};
var POS_STATE_CODE    = {pos: 180, size: 1};

var STATE = { A: "Groningen", G: "Gelderland",
              M: "Utrecht", B: "Friesland",
              H: "Zuid-Holland", P: "Noord-Brabant",
              D: "Drenthe", K: "Limburg",
              S: "Zeeland", E: "Overijssel",
              L: "Noord-Holland", X: "Flevoland"};

var TYPE = {"":"undeveloped", 0: "odd", 1:"even", 2:"houseboat", 3:"caravan"};

var counter;


function importCendris(fileName) {

  counter = 0;

  fs.exists(fileName, function(exists){
    if (exists){
      prepareDB(fileName);
    } else {
      console.log("file not found");
    }
  });
}

prepareDB = function(fileName){
  mongoClient.connect(url, function(err, db) {
    var col = db.collection(collectionName);
    col.drop(function(err, reply) {
      // err is goed want dan is er geen collection en dat willen we
      // reply == false is nog wel een issue
      // reply == true is goed, dan is gedropt
      createNewEntries(db, fileName, function(){
        console.log("closing db...");
        db.close();
      });
    });

  });
};


var createNewEntries = function(db, fileName, callback) {

    // Get the collection and bulk api artefacts
    var collection = db.collection(collectionName),
        bulk = collection.initializeOrderedBulkOp(), // Initialize the Ordered Batch
        counter = 0;

    var rd = readline.createInterface({
      input: fs.createReadStream(fileName),
      output: null
    });

    rd.on('line', function(line) {
      // console.log(line);
      if (line.substring(0,3) == "***"){
        // we hebben een header of een footer
        console.log(line);
        if (counter > 1){
          bulk.execute(function(err, result) {
              //  console.log(JSON.stringify(err));
              //  console.log(JSON.stringify(result));

              callback();
          });

        }

      } else {
        // dit is een postcode record
        counter++;
        var rec = {
          postcode: (getValue(line, POS_POSTCODE_NUM) + getValue(line, POS_POSTCODE_ALF)),
          min_number: getInt(line, POS_MIN_NUMBER),
          max_number: getInt(line, POS_MAX_NUMBER),
          number_type: TYPE[getValue(line, POS_POSTCODE_TYPE)],
          street: getValue(line, POS_STREET),
          city: getValue(line, POS_CITY),
          state: STATE[getValue(line, POS_STATE_CODE)]
        };
        console.log(counter.toString() + ": "+ JSON.stringify(rec));

        bulk.insert(rec);

        if (counter % 100 == 0 ) {
            // Execute the operation
            console.log("Bulk exe..");

            bulk.execute(function(err, result) {
                // re-initialise batch operation

                callback();
            });
            bulk = collection.initializeOrderedBulkOp();
        }

      }
    });

    rd.on('close', function() {
    });

};


completionRoutine = function(db){
  console.log('Closing db');
  db.close();
};

getValue = function(line, subs){
  var val = line.substring(offset + subs.pos, offset + subs.pos + subs.size);
  return val.trim();
};

getInt = function(line, subs){
  var val = parseInt(getValue(line, subs));
  if (val.isNaN){ val = 0;}
  return val;
};


var fileName = '../in/cendris/pctmutr.txt';

importCendris(fileName);
