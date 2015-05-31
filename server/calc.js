function calc(topic) {
    ~ function iter() {
        var isClose = topic.status == 'close' || topic.end < Date.now();
        if (isClose) {
            // TODO: Close the topic
        } else {
            // TODO: calc price and insert price object
            compute(topic)
            Meteor.setTimeout(iter, 2000);
        }
    }();
}

function compute(topic) {
    // var last = Bets.find({topic: topic._id}, {limit: 100, sort: {mtime:-1}});
    var last = Bets.find({
        topic: topic._id,
        mtime: {
            $gt: Date.now() - 2000
        }
    });
    var counter = {
        postive: 0,
        negtive: 0
    }
    last.forEach(function(doc) {
        var att = doc.attitude;
        counter[att] ++;
    });
    logger.trace(counter)
    var newPrice = {
        topic: topic._id,
        price: getP(Prices.current(topic), counter.postive, counter.negtive),
    }
    logger.trace(newPrice)
    // Prices.insert(newPrice);
    Topics.update(topic._id, {$set: {price: parseInt(newPrice.price), _NO_MODIFY:true}});
}

function getP(p0, a, b) {
    var x = getX(a, b);
    var xx = 0;
    if (x < 80 && x > -80) {
        // xx = x + Utils.arrRand([-1,0,1]);
        xx = x + Utils.arrRand([-5, -4, -3, -2, 2, 3, 4, 5]);
    } else {
        xx = x;
    }
    var p = xx + p0;
    if (p > 100) {
        return 100;
    } else if (p < -100) {
        return -100;
    }
    return p;
}

function getX(a, b) {
    if (a + b < 10) {
        return a - b;
    }
    var c = a / b;
    if (c > 1) {
        return incr(c);
    } else if (c < 1) {
        return 0 - incr(b / a);
    }
    return 0;
}

function incr(c) {
    var map = [{
        'end': 1.1,
        'num': 1
    }, {
        'end': 1.2,
        'num': 2
    }, {
        'end': 1.4,
        'num': 3
    }, {
        'end': 1.6,
        'num': 4
    }, {
        'end': 2,
        'num': 5
    }, {
        'end': 2.5,
        'num': 7
    }, {
        'end': 5,
        'num': 10
    }, {
        'end': 10,
        'num': 15
    }, ];
    for (var begin = 1, i = 0; i < map.length; i++) {
        var end = map[i].end;
        if (c > begin && c <= end) {
            return map[i].num;
        }
        begin = end;
    }
    return 20;
}

function init() {
    // Observer
    // watch for topic insert, then start a calc proccess
    var topic = Topics.find({
        status: 'open'
    });
    topic.observe({
            added: calc
        })
    // watch for topic status changes, then close related bets auto.
    Topics.find({
            status: 'close'
        }).observe({
            added: function(topic) {
                Bets.update({
                    topic: topic._id,
                    status: 'open'
                }, {
                    $set: {
                        status: 'close',
                        close: topic.price || topic.open || 0,
                    }
                }, {multi: true});
                // Mark ranking of topic is final
                var rank = Rankings.findOne({type:'topic', topic:topic._id}, {sort:{mtime:-1}});
                if (rank) {
                    Rankings.update(rank._id, {$set: {isFinal:true}});
                }
                logger.info('Topic closed, id:' + topic._id);
            }
        })
    // watch for bets status changes, then calc the scores of bet
    Bets.find({status: 'close', settled: {$exists: false}}).observe({
        added: function (bet) {
            Bets.update(bet._id, {$set:{ settled:true}});
            Meteor.users.update({_id:bet.user}, {$inc: {'fortune.scores': Api.profit(bet)}})
        }
    })
    Meteor.users.find({'fortune.scores':{$exists:false}}).observe({
        added: function (user) {
            Meteor.users.update(user._id, {$set: {'fortune.scores':0}});
        }
    })    
    Meteor.users.find({'fortune.credits':{$exists:false}}).observe({
        added: function (user) {
            Meteor.users.update(user._id, {$set: {'fortune.credits':0}});
        }
    })
    // Calc credits after topic close.
    Rankings.find({type:'topic', settled:{$exists: false}, isFinal: true}).observe({
        added: function (rank) {
            rank.list.forEach(function (v,k) {
                var credits = Consts.topicRankMap[v.real-1][3];
                Meteor.users.update(v.user, {$inc: {'fortune.credits': credits}});
                var c = {
                    user: v.user,
                    ranking: rank._id,
                    topic: rank.topic,
                    source: rank.type,
                    credits: credits,
                    detail: v,
                    type: 'in',
                };
                Credits.insert(c);
            })
            Rankings.update(rank._id, {$set: {settled:true}});
            logger.info('Calc credits done, ranking:', rank._id);
        }
    })

}
Calc = {
    init: init,
}
