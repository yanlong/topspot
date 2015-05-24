SyncedCron.add({
    name: 'Calc day rankings',
    schedule: function(parser) {
        // parser is a later.parse object
        // return parser.text('every 5 seconds');
        return parser.text('every 1 minutes');
        // return parser.text('at 00:00 am');
    },
    job: function() {
        Consts.catalogList.forEach(function(catalog) {
            Models.rankings.insert({
                list: Rank.day(Date.now(), catalog == 'All'? null:catalog),
                type: 'day',
                catalog: catalog,
                date: moment().format('YYYY-MM-DD'),
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
        return parser.text('every 1 minutes');
        // return parser.text('at 00:00 am');
    },
    job: function() {
        Topics.find({status: 'open'}).forEach(function(topic) {
            Models.rankings.insert({
                list: topicRank(topic),
                type: 'topic',
                // date: moment().format('YYYY-MM-DD'),
            })
        })
        return;
    }
});

function topicRank(topic) {
    var pre = Rankings.findOne({type:'topic'}, {sort:{mtime:-1}});
    var now = Rank.topicRank(topic._id);
    pre = _.reduce(pre.list, function (memo, v, k) {
        memo[v.user] = k;
        return memo;
    }, {})
    now.forEach(function (v, k) {
        v.delta = (pre[v.user] || 0) - k;
    })
    return now;
}

SyncedCron.start();