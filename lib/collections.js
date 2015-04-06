Topics = new Mongo.Collection('topics');
Bets = new Mongo.Collection('bets');
Prices = new Mongo.Collection('prices');
Comments = new Mongo.Collection('comments');
Favors = new Mongo.Collection('favors');

// Create indexes
Topics._ensureIndex({user:1, mtime: 1});
Bets._ensureIndex({topic:1, mtime: -1});
Prices._ensureIndex({topic:1, mtime: -1});
Comments._ensureIndex({topic:1, mtime: 1});

// Observer
// watch for topic insert, then start a calc proccess
// watch for topic status changes, then close related bets auto.
// watch for bets status changes, then calc the scores of bet

var Models = {
	Topics: Topics,
	Bets: Bets,
	Prices: Prices,
	Comments: Comments,
	Favors: Favors,
}

_.each(Models, function (v, k) {
	global[k].before.insert(beforeInsert);
	global[k].before.update(beforeUpdate);
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
            status: Utils.arrRand(['open', 'close'])
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
        attitude: Utils.arrRand(['postive','negtive']),
        open: Utils.rand(),
        close: null,
        status: Utils.arrRand(['open', 'close']),
    })
}

function initComments(index, topicId, userId) {
    var c = Comments.insert({
        user: userId,
        topic: topicId,
        content: '评价内容'+Utils.rand(),
        replyTo: '',
    })
    var count = Utils.rand();
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

function beforeInsert(userId, doc) {
    var now = Date.now();
    doc.ctime = now;
    doc.mtime = now;
}

function beforeUpdate(userId, doc, fieldNames, modifier ) {
	var now = Date.now();
    modifier.$set.mtime = now;
}


Prices.current = function (topic) {
    var topicId = typeof topic === 'object' ? topic._id : topic;
    var current = Prices.findOne({topic:topicId}, {sort:{mtime: -1}});
    current = current || {};
    return current.price || 50; // default price
}