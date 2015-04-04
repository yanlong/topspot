Meteor.startup(function() {
    // listen on topic insert
    Topics.after.insert(function(userId, doc) {
        // set a timer for open topic
        Meteor.setTimeout(doc.begin - Date.now(), function() {
            // TODO: set the status of topic to BEGIN
            // begin to calc periodly
            calc(doc);
        })
    })
    Topics.find({status: 'open'}).forEach(calc)
})

function calc(topic) {
    ~function iter() {
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
    var last = Bets.find({}, {limit: 100, sort: {mtime:-1}});
    var counter = {postive:0, negtive:0}
    last.forEach(function(doc) {
         var att = doc.attitude;
         counter[att]++;
    });
    console.log(counter)
    // console.log(current)
    var newPrice = {
        topic: topic._id,
        price: Prices.current(topic) + counter.postive,
    }
    console.log(newPrice)
    Prices.insert(newPrice);
}