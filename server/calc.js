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
    Topics.update(topic._id, {$set: {price: newPrice.price, _NO_MODIFY:true}});
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
                        status: 'close'
                    }
                }, {multi: true});
                logger.info('Topic closed, id:' + topic._id);
            }
        })
    // watch for bets status changes, then calc the scores of bet
    Bets.find({status: 'close', settled: {$exists: false}}).observe({
        added: function (bet) {
            Bets.update(bet._id, {$set:{ settled:true}});
            Meteor.users.update({_id:bet.user}, {$inc: {'fortune.scores': bet.close - bet.open}})
        }
    })
}
Calc = {
    init: init,
}
