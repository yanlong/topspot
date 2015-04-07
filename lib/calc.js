Meteor.startup(function() {
    // listen on topic insert
    Topics.after.insert(function(userId, doc) {
        // set a timer for open topic
        Meteor.setTimeout(function() {
            // TODO: set the status of topic to BEGIN
            // begin to calc periodly
            calc(doc);
        }, doc.begin - Date.now())
    })
    Topics.find({
        status: 'open'
    }).forEach(calc)
})

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
    Log.info(counter)
    var newPrice = {
        topic: topic._id,
        price: Prices.current(topic) + calcPrice(counter.postive, counter.negtive),
    }
    Log.info(newPrice)
    Prices.insert(newPrice);
}

function calcPrice(a, b) {
    if (a + b < 10) {
        return 0;
    }
    var c = a/b;
    if (c > 1) {
        return incr(c);
    } else if (c < 1) {
        return 0-incr(b/a);
    }
    return 0;
}

function incr(c) {
    var map = [
    {'end': 1.1, 'num': 1},
    {'end': 1.2, 'num': 2},
    {'end': 1.4, 'num': 3},
    {'end': 1.6, 'num': 4},
    {'end': 2, 'num': 5},
    {'end': 2.5, 'num': 7},
    {'end': 5, 'num': 10},
    {'end': 10, 'num': 15},
    ];
    for (var begin = 1, i=0; i < map.length; i++) {
        var end = map[i].end;
        if (c > begin && c <=end) {
            return map[i].num;
        }
        begin = end;
    }
    return 20;
}
