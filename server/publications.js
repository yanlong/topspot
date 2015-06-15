Meteor.publish('currentUser', function() {
  return Meteor.users.find(this.userId, {fields: {createdAt: 1, intercomHash: 1}});
});

Meteor.publish('topics', function (selector) {
    selector = selector ||{};
    selector.user = this.userId;
    var option = {
    	sort: {
    		status: -1,
    		// mtime: -1,
    	}
    }
    return Topics.find(selector,option);
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

Meteor.publish('users', function () {
	return Meteor.users.find();
})

Meteor.publish('feedbacks', function () {
	return Feedbacks.find();
})