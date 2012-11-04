/**
 *  A simple SMSified app built with Node.js and CouchDB.
 */
var http = require('http');
var config = require('./config');
var dbUrl = config.couchdb.host + ':' + config.couchdb.port;
var nano = require('nano')(dbUrl);
var follow = require('follow');
var db = nano.db.use(config.couchdb.dbname);

follow({ db: "https://jlank.iriscouch.com/safewalk", include_docs: true, since: 'now' }, function(error, change) {
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

var phone = client.getPhoneNumber('+15005550006');

setInterval(phone.setup(doCall), 5000);

var doCall = function() {

    // Alright, our phone number is set up. Let's, say, make a call:
    phone.makeCall('+15082729110', null, function(call) {

        // 'call' is an OutgoingCall object. This object is an event emitter.
        // It emits two events: 'answered' and 'ended'
        call.on('answered', function(reqParams, res) {

            // reqParams is the body of the request Twilio makes on call pickup.
            // For instance, reqParams.CallSid, reqParams.CallStatus.
            // See: http://www.twilio.com/docs/api/2010-04-01/twiml/twilio_request
            // res is a Twiml.Response object. This object handles generating
            // a compliant Twiml response.

            console.log('Call answered');

            // We'll append a single Say object to the response:
            res.append(new Twiml.Say('Hello, there!'));

            // And now we'll send it.
            res.send();
        });

        call.on('ended', function(reqParams) {
            console.log('Call ended');
        });
    });

    // But wait! What if our number receives an incoming SMS?
    phone.on('incomingSms', function(reqParams, res) {

        // As above, reqParams contains the Twilio request parameters.
        // Res is a Twiml.Response object.

        console.log('Received incoming SMS with text: ' + reqParams.Body);
        console.log('From: ' + reqParams.From);
    });

    // Oh, and what if we get an incoming call?
    phone.on('incomingCall', function(reqParams, res) {

        res.append(new Twiml.Say('Thanks for calling! I think you are beautiful!'));
        res.send();
    });
};


// Port the web server will run on.
var port = process.argv[2] || 8000;

// Web server to listen for incoming HTTP POSTs from SMSified.
var server = http.createServer(function(req, res) {
  req.addListener('data', function(data) {
        var inbound = new InboundMessage(JSON.parse(data));
        saveDoc(inbound);
  });
  res.writeHead(200);
  res.end();

}).listen(port);