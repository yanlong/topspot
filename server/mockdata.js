Meteor.startup(function() {
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
        while (--count) {
            var from = Utils.arrRand(users)._id;
            var to = Utils.arrRand(users)._id;
            if (from == to) {
                continue;
            }
            var follow = {
                user: from,
                target: to
            };
            if (Follows.findOne(follow)) {
                continue;
            }
            Follows.insert(follow);
        }
    }

    function initTopics(index, userId) {
        var t = Topics.insert({
            user: userId,
            title: '热门话题#' + index,
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
            end: Date.now() + 3600 * 1000 * 24 * 30,
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
            attitude: Utils.arrRand(['postive', 'negtive']),
            open: Utils.rand(),
            close: null,
            status: Utils.arrRand(['open', 'close']),
        })
    }

    function initComments(index, topicId, userId) {
        var c = Comments.insert({
            user: userId,
            topic: topicId,
            content: '评价内容' + Utils.rand(),
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
})