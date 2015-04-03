function calc(topic) {
    ~function iter() {
        var isClose = topic.status == 'close' || topic.end < Date.now();
        if (isClose) {
            // TODO: Close the topic
        } else {
            // TODO: calc price and insert price object

            setTimeout(iter, 2000);
        }
    }();
}

// listen on all topic insert

Topics.after.insert(function (userId, doc) {
    // set a timer for open topic
    setTimeout(doc.begin - Date.now(), function () {
        // TODO: set the status of topic to BEGIN
        // begin to calc periodly
        calc(doc);
    })
})

