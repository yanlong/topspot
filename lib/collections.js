Topics = new Mongo.Collection('topics');
Bets = new Mongo.Collection('bets');
Prices = new Mongo.Collection('prices');
Comments = new Mongo.Collection('comments');
Favors = new Mongo.Collection('favors');
Follows = new Mongo.Collection('follows');

if (Meteor.isClient) {
    return;
}

// Create indexes
Topics._ensureIndex({user:1, mtime: 1});
Bets._ensureIndex({topic:1, mtime: -1});
Prices._ensureIndex({topic:1, mtime: -1});
Comments._ensureIndex({topic:1, mtime: 1});
Favors._ensureIndex({comment:1, mtime: 1});
Follows._ensureIndex({user:1, mtime: 1});
Follows._ensureIndex({target:1, mtime: 1});
Follows._ensureIndex({user:1, target: 1}, {unique: true});

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
var TEST_NUM = Consts.test.num;

if (Topics.find().count() == 0) {
    init();
}

function init() {
    for (var i = 0; i < TEST_NUM; i++) {
        initUsers(i);
    }
}

function initUsers(index) {
    var u = Accounts.createUser({
        username: 'topspot'+index,
        email: 'topspot'+index+'@gmail',
        password: 'topspot',
        profile: {
            phone: Math.floor(Math.random() * 1e11 + 1e10),
            portrait: 'http://wx.qlogo.cn/mmopen/g3MonUZtNHkdmzicIlibx6iaFqAc56vxLSUfpb6n5WKSYVY0ChQKkiaJSgQ1dZuTOgvLLrhJbERQQ4eMsv84eavHiaiceqxibJxCfHe/0',
        },
    })
    for (var i = 0; i < TEST_NUM; i++) {
        initTopics(i, u);
    }
    initFollows();
}

function initFollows() {
    var users = Meteor.users.find().fetch();
    var count = 10;
    while(--count) {
        var from = Utils.arrRand(users)._id;
        var to = Utils.arrRand(users)._id;
        if (from == to) {
            continue;
        }
        var follow = {user:from, target:to};
        if (Follows.findOne(follow)) {
            continue;
        }
        Follows.insert(follow);
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
            catalog: Utils.arrRand(['娱乐', '体育', '财经', '游戏', '其它']),
            subcatalog: Utils.arrRand(['娱乐', '体育', '财经', '游戏', '其它']),
            tags: [Utils.arrRand(['推荐','最热'])],
            begin: Date.now(),
            end: Date.now() + 3600*1000*24*30,
            status: Utils.arrRand(['open', 'close'])
        });
    for (var i = 0; i < 10; i++) {
        // initBets(i, t, userId);
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
    if (!hasUpdateOperator(modifier)) {
        modifier.mtime = now;
    } else {
        modifier.$set = modifier.$set || {};
        modifier.$set.mtime = now;
    }
}

Prices.current = function (topic) {
    var topicId = typeof topic === 'object' ? topic._id : topic;
    var current = Prices.findOne({topic:topicId}, {sort:{mtime: -1}});
    current = current || {};
    return current.price === undefined ? 50 : current.price; // default price
}

function hasUpdateOperator(fields) {
    for (var key in fields) {
        if (key.charAt(0) === '$') {
            return true;
        }
    }
    return false;
}