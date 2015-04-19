Template.addTopic.events({
    'submit form': function(e) {
        e.preventDefault();
        var topic = {
        };
        Schemas.topic.forEach(function(v) {
                topic[v.name] = $(e.target).find('[name=' + v.name + ']').val();
            })
        topic.user = Meteor.userId();
        var id = Topics.insert(topic);
        Router.go('topicList');
    }
})
Template.addTopic.helpers({
    types: Schemas.topic,
})
Template.index.helpers({
    status: function() {
        return Meteor.status();
    }
})