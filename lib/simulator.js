// simulate people bets

Meteor.startup(function() {

    Meteor.setInterval(function () {
        Topics.find({}, {limit: 10}).forEach(function (doc) {
            var id = Bets.insert({
                topic: doc._id,
                open: Prices.current(doc),
                attitude: ['postive', 'negtive', 'negtive', 'negtive'][Date.now()%4],
            })
            // console.log('bet:'+id)
        })
    }, 100)
})

