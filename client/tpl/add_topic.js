Template.addTopic.events({
    'submit form':function (e) {
        e.preventDefault();

        var topic = {
            url: $(e.target).find('[name=url]').val(),
            title: $(e.target).find('[name=title]').val()
        };

        // alert(post.url)
        var id = Topics.insert(topic);
        Router.go('topicList');
    }
})

Template.index.helpers({
    status: function () {
        return Meteor.status();
    }
})