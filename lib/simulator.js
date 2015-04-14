// simulate people bets

Meteor.startup(function() {
    if (process.env.SIMULATOR != 'on') return;
    Meteor.setInterval(function () {
        var users = Meteor.users.find().fetch();
        Topics.find({status: 'open'}, {limit: 1000}).forEach(function (doc) {
            var id = Bets.insert({
                topic: doc._id,
                user: users[Utils.rand() % 3]._id,
                open: Prices.current(doc),
                attitude: ['postive', 'postive', 'negtive', 'negtive'][Date.now()%4],
                status: 'open',
            })
            // console.log('bet:'+id)
            // close in the future
            Meteor.setTimeout(function () {
                Bets.update({
                    _id: id,
                }, {
                    $set: {
                        status: 'close',
                        close: Prices.current(doc),
                    }
                })
                logger.trace('close bet:'+id)
            }, Utils.rand()*500);
        })
    }, 150)
    logger.info('Simulator started.');
})

