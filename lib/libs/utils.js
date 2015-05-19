Utils = {}

Utils.rand = function () {
    return Math.floor(Math.random() * 100);
}

Utils.arrRand = function (arr) {
    return arr[this.rand()%arr.length];
}


Utils.datetime2timestamp = function(datetime) {
	return moment(datetime).unix() * 1000;
}

Utils.timestamp2datetime = function(timestamp) {
	return moment(timestamp).format('YYYY-MM-DDTHH:mm:ss');
}
