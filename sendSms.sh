#!/bin/bash

curl -X POST "https://api.twilio.com/2010-04-01/Accounts/$1/SMS/Messages.json" \
-d "From=%2B$2" \
-d "To=%2B$3" \
-d "Body=$4" \
-u $1:$5