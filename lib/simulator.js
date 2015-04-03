// simulate people bets

Meteor.startup(function() {

    Meteor.setInterval(function () {
        Topics.find({}, {limit: 10}).forEach(function (doc) {
            var current = Bets.findOne({topic:doc._id}, {sort:{mtime: -1}}).price;
            var id = Bets.insert({
                topic: doc._id,
                price: current,
                attitude: ['postive', 'negtive', 'negtive', 'negtive'][Date.now()%4],
            })
            // console.log('bet:'+id)
        })
    }, 100)
})