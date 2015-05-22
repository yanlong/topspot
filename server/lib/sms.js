var uri = '/2013-12-26/Accounts/%s/SMS/TemplateSMS?sig=%s'
// var host = 'https://sandboxapp.cloopen.com:8883';
var host = 'https://app.cloopen.com:8883';
var crypto = Npm.require('crypto')
var accountSid = 'aaf98f894ce46b08014ce95a70dd03ec';
var accountToken = '1b596555cf2d45109dc0b3c3cbaf9cd0';

function send(phone, code) {
	var body = {
		to: phone,
		// appId: '8a48b5514ce46cb8014ce95ad37d0490', // fortest
		// templateId: '1',
		appId: '8a48b5514ce46cb8014ce9608b3c049a', // online
		templateId: '20120',
		datas: [ new String(code), '1'],
	};

	var batch = moment().format('YYYYMMDDHHmmss');

	var sig = crypto.createHash('md5').update(accountSid + accountToken + batch).digest('hex').toUpperCase();
	var auth = new Buffer(accountSid + ":" + batch);
	auth = auth.toString("base64");

	var option = {
		url: host + Npm.require('util').format(uri, accountSid, sig),
		headers: {
			Authorization: auth,
			Accept: 'application/json',
			'Content-Type': 'application/json;charset=utf-8;',
		},
		method: 'post',
		json: body,
	}
	var ret = HTTP.call('post', option.url, {
		data: option.json,
		headers: option.headers
	});
	if (ret.statusCode != 200) {
		throw new Meteor.Error('Http request failed, caused by:'+ret.content);
	}
	var content = JSON.parse(ret.content);
	if (content.statusCode != 0) {
		throw new Meteor.Error('Request sms service failed, caused by:'+ret.content);
	}
}

Sms = {
	send: send
}