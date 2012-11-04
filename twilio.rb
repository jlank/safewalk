require 'rubygems'
require 'twilio-ruby'

@account_sid = ''
@auth_token = ''

# set up a client to talk to the Twilio REST API
@client = Twilio::REST::Client.new(@account_sid, @auth_token)

@account = @client.account
@message = @account.sms.messages.create({:from => '+15005550006', :to => '', :body => 'heyoo'})
puts @message