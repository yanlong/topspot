return ; // close
var UPYUN = Meteor.npmRequire('upyun');

var upyun = new UPYUN('caogen-images', 'topspot', 'caogen123', 'ctcc', 'legacy');

upyun.uploadFile('/test', './upyun.js', 'text/plain', true, function(err, result) {
	//...
	console.log(result);
})

