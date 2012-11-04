
/*
 * POST a safewalk page.
 */

exports.index = function(req, res){

var config = require('../config');
var Twiml = require('twilio').Twiml;
var dbUrl = config.couchdb.host + ':' + config.couchdb.port;
var nano = require('nano')(dbUrl);
var follow = require('follow');
var db = nano.db.use(config.couchdb.dbname);
var request = require('request');
var spawn = require('child_process').spawn;

var acctSid = config.twilio.acctSid,
    authTok = config.twilio.authTok,
    twiHost = config.twilio.twiHost,
    fromNumber = config.contacts.fromNumber,
    message = "hey can you safe-walk me home? http://bit.ly/VqIcgY";


   var contacts = config.contacts.list;
   var length = 0;

  contacts.forEach(function (toNumber) {
    var sms = spawn('./sendSms.sh', [acctSid, fromNumber, toNumber, message, authTok]);

    sms.stderr.setEncoding('utf8');
    sms.stdout.setEncoding('utf8');

    sms.stderr.on('data', function (data) {
      console.error(data);
    });

    sms.stdout.on('data', function (data) {
      console.log(data);
    });

    sms.on('exit', function (code, signal) {
      if(code === 0) {
        length++;
        console.log('sent sms to ' + toNumber);
      }

      if (length === contacts.length) {
        res.send({ sent: 'sent texts to ' + contacts.join(' ') });
      }
    });
  });
};