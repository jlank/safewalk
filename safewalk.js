/**
 *  A simple SMSified app built with Node.js and CouchDB.
 */
var http = require('http');
var config = require('./config');
var Twiml = require('twilio').Twiml;
var dbUrl = config.couchdb.host + ':' + config.couchdb.port;
var nano = require('nano')(dbUrl);
var follow = require('follow');
var db = nano.db.use(config.couchdb.dbname);

follow({ db: dbUrl, include_docs: true, since: 'now' }, function(error, change) {
  if(!error)
    console.log("Got change number " + change.seq + ": " + change.id);
});

// Function to save / update a doc in CouchDB.
function saveDoc(doc) {
  db.save(doc, function(err, res) {
    if (err) {
      console.log('Could not save document.');
    } else {
      console.log('Document saved: ' + res.id);
    }
  });
}

var acctSid = config.twilio.acctSid,
    authTok = config.twilio.authTok,
    twiHost = config.twilio.twiHost;

var TwilioClient = require('twilio').Client,
    client = new TwilioClient(acctSid, authTok, twiHost);

var phone = client.getPhoneNumber('+15082194261');

phone.setup(function() {
/*
    phone.makeCall('+13016418246', null, function(call) {
        console.log('making call');
        call.on('answered', function(callParams, response) {
            response.append(new Twiml.Say('Hey Nathan!  I got the Twilio API working.  Rock On.  From John'));
            response.send();
        });
    });
*/
    phone.on('incomingSms', function(reqParams, response) {
      console.log(reqParams);
      console.log('Received incoming SMS with text: ' + reqParams.Body);
      console.log('From: ' + reqParams.From);
      response.append(new Twiml.Sms('whats up!'));
      response.send();
      console.log('sent response');
    });


});
