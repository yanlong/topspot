// simulate people bets

Meteor.startup(function() {

    Meteor.setInterval(function () {
        Topics.find({}, {limit: 10}).forEach(function (doc) {
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
                    $set: {status: 'close'}
                })
                Log.info('close bet:'+id)
            }, Utils.rand()*500);
        })

        // 
    }, 100)
})

