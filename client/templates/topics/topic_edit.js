Template.topicEdit.helpers({
    types: Schemas.topic,
    value: function (data) {
        return data[this.name]
    }
})

Template.topicEdit.events({
    'submit form': function(e) {
        e.preventDefault();
        // var topic = Topics.findOne(this.data._id);
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
            if (v.type == 'number') {
                value = parseInt(value);
            }
            topic[v.name] = value;
        }
        topic.user = Meteor.userId();
        var id = Topics.update(this.data._id, {$set:topic});
        Router.go('topicList');
    }
})
