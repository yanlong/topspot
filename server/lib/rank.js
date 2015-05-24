function baseRank(bets, top, base) {
    top = top || Meteor.users.find().count();
    var counter = {}
    bets.forEach(function(doc, index) {
        var user = doc.user;
        if (!counter[user]) counter[user] = 0;
        counter[user] += (doc.close || base) - doc.open;
    })
    var scores = _.map(counter, function(v, k) {
        return {
            user: k,
            scores: v
        };
    })
    var tops = _.sortBy(scores, 'scores').reverse()
    tops.map(function(v, index, arr) {
        index += 1;
        var r = Math.ceil(index / arr.length * 100);
        v.index = index;
        v.real = r;
        v.real2 = Math.ceil(r/10)*10;
        return v;
    });
    return tops.slice(0, top);
}

function dayRank(time, catalog) {
    var hour = 3600 * 1000;
    var day = hour * 24;
    var rank = timeRank(time, day, catalog && {catalog: catalog});
    return rank.map(function(v, index, arr) {
        var r = v.real;
        // v.nominal = Consts.dayRankMap[r-1][1];
        // v.mark = Consts.dayRankMap[r-1][2];
        return v;
    });
}

function timeRank(time, scope, filter) {
    var begin = Math.floor(time/scope) * scope;
    var end = begin + scope - 1;
    var selector = {
        status: 'close',
        mtime: {
            $gt: begin,
            $lt: end,
        }
    };
    if (filter) {
        selector.topic = {$in: filterTopic(filter)};
    }
    var bets = Bets.find(selector, {
        sort: {
            mtime: -1
        },
        limit: 10000, // fortest
    })
    logger.info('Time rankings:', filter, bets.count())
    return baseRank(bets);
}

function filterTopic(filter) {
    var ids = [];
    Topics.find(filter).forEach(function (v) {
        ids.push(v._id);
    })
    return ids;
}

function topicRank(topic, top) {
    var bets = Bets.find({
        topic: topic
    }, {
        limit: 10000, // fortest, should not limits
    })
    var rank = baseRank(bets, top, Topics.findOne(topic).price);
    logger.info('Topic rankings:', topic);
    return rank.map(function(v, index, arr) {
        var r = v.real;
        v.nominal = Consts.topicRankMap[r-1][1];
        v.mark = Consts.topicRankMap[r-1][2];
        return v;
    });
}

Rank = {
    day: dayRank,
    time: timeRank,
    rank: baseRank,
    topicRank: topicRank,
}