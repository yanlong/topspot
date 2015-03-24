Topics = new Mongo.Collection('topics');
Bets = new Mongo.Collection('bets');
Prices = new Mongo.Collection('prices');


if (Topics.find().count() == 0) {
    init();
}
function init() {
    for (var i = 0; i < 10; i++) {
        initTopics(i);
    }
}

function initTopics(index) {
    var t = Topics.insert({
            title: '热门话题#'+index,
            subtitle: '热门话题副标题' + index,
            abstract: '话题摘要',
            desc: '背景描述',
            catalog: '分类',
            begin: 13412312312312,
            end: 13412312312312,
            status: 'ing',
        });
    for (var i = 0; i < 10; i++) {
        initBets(i, t);
    }
}

function initBets(index, topicId) {
    var b = Bets.insert({
        topic: topicId,
        price: Math.floor(Math.random() * 100),
        status: 'open',
    })
}
