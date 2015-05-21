Template.topicCreate.events({
    'submit form': function(e,template) {
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
            if (v.type == 'file') {
                value = [$(e.target).find('[name=' + v.name + ']').attr('data-url')];
                // alert(value)
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

