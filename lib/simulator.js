// simulate people bets

Meteor.startup(function() {

    Meteor.setInterval(function () {
        Topics.find({status: 'open'}, {limit: 1000}).forEach(function (doc) {
            var id = Bets.insert({
                topic: doc._id,
                open: Prices.current(doc),
                attitude: ['postive', 'negtive', 'negtive', 'negtive'][Date.now()%4],
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
                Log.info('close bet:'+id)
            }, Utils.rand()*500);
        })

        // 
    }, 100)
})

