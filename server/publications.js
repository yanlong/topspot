Meteor.publish('currentUser', function() {
  return Meteor.users.find(this.userId, {fields: {createdAt: 1, intercomHash: 1}});
});

Meteor.publish('topics', function () {
    var selector = {};
    selector.user = this.userId;
    return Topics.find(selector);
})