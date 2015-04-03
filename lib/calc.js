function calc(topic) {
    ~function itor() {
        var isClose = topic.end < Date.now();
        if (isClose) {
            // Colose the topic
        } else {
            setTimeout(itor, 2000);
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

