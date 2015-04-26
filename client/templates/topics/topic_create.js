Template.topicCreate.events({
    'submit form': function(e) {
        e.preventDefault();
        var topic = {};
        for (var i in Schemas.topic) {
            var v = Schemas.topic[i];
            var value = $(e.target).find('[name=' + v.name + ']').val();
            if (!value && !v.optional) {
                alert('Invaild value: ' + v.name);
                return;
            }
            topic[v.name] = value;
        }
        topic.user = Meteor.userId();
        var id = Topics.insert(_.extend({status: 'open'}, topic));
        Router.go('topicList');
    }
})
Template.topicCreate.helpers({
    types: Schemas.topic,
})