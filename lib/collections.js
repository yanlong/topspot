Topics = new Mongo.Collection('topics');
Bets = new Mongo.Collection('bets');
Prices = new Mongo.Collection('prices');
Comments = new Mongo.Collection('comments');
Favors = new Mongo.Collection('favors');

var Models = {
	Topics: Topics,
	Bets: Bets,
	Prices: Prices,
	Comments: Comments,
	Favors: Favors,
}

_.each(Models, function (v, k) {
	global[k].before.insert(beforeInsertOrUpdate);
	global[k].before.update(beforeInsertOrUpdate);
})
if (Topics.find().count() == 0) {
    init();
}
function init() {
    for (var i = 0; i < 3; i++) {
        initUsers(i);
    }
}

function initUsers(index) {
    var u = Accounts.createUser({
        email: 'topspot'+index+'@gmail',
        password: 'topspot',
    })
    for (var i = 0; i < 10; i++) {
        initTopics(i, u);
    }
}

function initTopics(index,userId) {
    var t = Topics.insert({
            user: userId,
            title: '热门话题#'+index,
            subtitle: '热门话题副标题' + index,
            abstract: '话题摘要',
            desc: '背景描述',
            rule: '规则',
            images: ['http://img3.douban.com/view/photo/photo/public/p2203381544.jpg'],
            postive: '正面描述',
            negtive: '反面描述',
            catalog: '分类',
            begin: 13412312312312,
            end: 13412312312312,
            status: arrRand(['open', 'close'])
        });
    for (var i = 0; i < 10; i++) {
        initBets(i, t, userId);
        initComments(i, t, userId);
    }
}

function initBets(index, topicId, userId) {
    var b = Bets.insert({
        user: userId,
        topic: topicId,
        attitude: arrRand(['postive','negtive']),
        price: rand(),
        status: arrRand(['open', 'close']),
    })
}

function initComments(index, topicId, userId) {
    var c = Comments.insert({
        user: userId,
        topic: topicId,
        content: '评价内容'+rand(),
        replyTo: '',
    })
    var count = rand();
    for (var i = 0; i < count; i++) {
    	initFavors(i, c, userId);
    }
}

function initFavors(index, commentId, userId) {
	var f = Favors.insert({
		user: userId,
		comment: commentId,
	})
}

function beforeInsertOrUpdate(userId, doc) {
	var now = Date.now();
	if (!doc.ctime) {
		doc.ctime = now;
	}
	doc.mtime = now;
}

function rand() {
	return Math.floor(Math.random() * 100);
}

function arrRand(arr) {
    return arr[rand()%arr.length];
}