Meteor.publish('currentUser', function() {
  return Meteor.users.find(this.userId, {fields: {createdAt: 1, intercomHash: 1}});
});

Meteor.publish('topics', function (selector) {
    selector = selector ||{};
    selector.user = this.userId;
    return Topics.find(selector);
})

Meteor.publish('singleTopic', function (id) {
    return Topics.find(id);
})

Meteor.publish('currentPrice', function (topicId) {
    return Prices.last(topicId);
})

Meteor.publish('latestBets', function (topicId, top) {
    return Bets.find({topic: topicId}, {sort: {mtime:-1}, limit: top || 10});
})

Meteor.publish('images', function () {
	return Images.find();
})