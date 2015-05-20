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
            if (v.type == 'datetime-local') {
                value = Utils.datetime2timestamp(value);
            }
            topic[v.name] = value;
        }
        topic.user = Meteor.userId();
        var id = Topics.insert(_.extend({
            status: 'open'
        }, topic));
        Router.go('topicList');
    }
})
Template.topicCreate.helpers({
    types: Schemas.topic,
})

Template.topicCreate.events({
    'change #title': function(event, template) {
        var files = event.target.files;
        for (var i = 0, ln = files.length; i < ln; i++) {
            Images.insert(files[i], function(err, fileObj) {
                // Inserted new doc with ID fileObj._id, and kicked off the data upload using HTTP
            });
        }
    }
});