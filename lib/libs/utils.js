Utils = {}

Utils.rand = function () {
    return Math.floor(Math.random() * 100);
}

Utils.arrRand = function (arr) {
    return arr[this.rand()%arr.length];
}
