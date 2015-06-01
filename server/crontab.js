SyncedCron.add({
    name: 'Calc day rankings',
    schedule: function(parser) {
        // parser is a later.parse object
        // return parser.text('every 5 seconds');
        // return parser.text('every 1 minutes');
        return parser.text('at 00:00 am');
    },
    job: function() {
        Consts.catalogList.forEach(function(catalog) {
            Rankings.insert({
                list: Rank.day(Date.now(), catalog == 'All'? null:catalog),
                type: 'day',
                catalog: catalog,
                date: moment(Date.now() - 1000*60*10).format('YYYY-MM-DD'),
            })
        })
        return;
    }
});

SyncedCron.add({
    name: 'Calc month rankings',
    schedule: function(parser) {
        return parser.cron('0 0 1 */1 *');
        // return parser.cron('* * * * *');
    },
    job: function() {
        Consts.catalogList.forEach(function(catalog) {
            Rankings.insert({
                list: Rank.month(Date.now(), catalog == 'All'? null:catalog),
                type: 'month',
                catalog: catalog,
                date: moment(Date.now() - 1000*60*10).format('YYYY-MM'),
            })
        })        
        return;
    }
});

SyncedCron.add({
    name: 'Calc topic rankings',
    schedule: function(parser) {
        // parser is a later.parse object
        // return parser.text('every 5 seconds');
        return parser.text('every 10 minutes');
        // return parser.text('at 00:00 am');
    },
    job: function() {
        Topics.find({status: 'open'}).forEach(function(topic) {
            var doc = {
                list: topicRank(topic),
                type: 'topic',
                topic: topic._id,
                // date: moment().format('YYYY-MM-DD'),
            };
            Rankings.insert(doc)
        })
        return;
    }
});

SyncedCron.add({
    name: 'Calc price of topics',
    schedule: function(parser) {
        // parser is a later.parse object
        // return parser.text('every 5 seconds');
        return parser.text('every 1 minutes');
        // return parser.text('at 00:00 am');
    },
    job: function() {
        Topics.find({status: 'open'}).forEach(function(topic) {
            Prices.insert({
                topic: topic._id,
                price: topic.price || topic.open,
            })
        })
        return;
    }
});

SyncedCron.add({
    name: 'Calc total fortune for user',
    schedule: function(parser) {
        // parser is a later.parse object
        // return parser.text('every 5 seconds');
        // return parser.text('every 1 minutes'); // every day
        return parser.text('at 00:00 am');
    },
    job: function() {
        Meteor.users.find().forEach(function(user) {
            FortuneHistory.insert({
                user: user._id,
                fortune: {
                    scores: Api.total(user._id),   // total scores, include floating
                    base: Api.base(user._id),       // base scores in user account
                },
                date: moment().format('YYYY-MM-DD'),
            })
        })
        return;
    }
});

function topicRank(topic) {
    var pre = Rankings.findOne({type:'topic', topic: topic._id}, {sort:{mtime:-1}});
    var now = Rank.topicRank(topic._id);
    pre = pre ? _.reduce(pre.list, function (memo, v, k) {
        memo[v.user] = k;
        return memo;
    }, {}) : {};
    now.forEach(function (v, k) {
        v.delta = (pre[v.user] || 0) - k;
    })
    return now;
}

SyncedCron.start();