function rank(bets, top) {
    top = top || Meteor.users.find().count();
    var counter = {}
    bets.forEach(function(doc, index) {
        var user = doc.user;
        if (!counter[user]) counter[user] = 0;
        counter[user] += (doc.close) - doc.open;
    })
    var scores = _.map(counter, function(v, k) {
        return {
            user: k,
            scores: v
        };
    })
    var tops = _.sortBy(scores, 'scores').slice(-top).reverse()
    return tops;
}

function dayRank(time, catalog) {
    var hour = 3600 * 1000;
    var day = hour * 24;
    var rank = timeRank(time, day, catalog && {catalog: catalog});
    return rank.map(function(v, index, arr) {
        // v.user = Meteor.users.findOne(v.user);
        // delete v.user.services;
        index += 1;
        var r = Math.ceil(index / arr.length * 100);
        v.index = index;
        v.real = r;
        v.real2 = Math.ceil(r/10)*10;
        // v.nominal = Consts.topicRankMap[r-1][1];
        // v.mark = Consts.topicRankMap[r-1][2];
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
        }
    })
    logger.info('Rankings:', filter, bets.count())
    return rank(bets);
}

function filterTopic(filter) {
    var ids = [];
    Topics.find(filter).forEach(function (v) {
        ids.push(v._id);
    })
    return ids;
}

Rank = {
    day: dayRank,
    time: timeRank,
    rank: rank,
}