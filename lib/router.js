Router.configure({
    layoutTemplate: 'layout',
    // loadingTemplate: 'loading',
    // notFoundTemplate: 'notFound',
    waitOn: function() {
        return [
            Meteor.subscribe('currentUser')
        ]
    }
});

Router.route('/', {
    name: 'home'
})
Router.route('/topics/create', {
    name: 'topicCreate'
})
Router.route('/topics/:_id', {
    name: 'topicPage',
    waitOn: function() {
        return [
            Meteor.subscribe('singleTopic', this.params._id),
            Meteor.subscribe('currentPrice', this.params._id),
        ]
    },
    data: function() {
        var topic = Topics.findOne(this.params._id);
        var other = {
            last: Prices.current(this.params._id)
        }
        return _.extend(topic, other);
    }
})

Router.route('/topics', {
    name: 'topicList',
    waitOn: function() {
        return Meteor.subscribe('topics')
    },
    data: function() {
        return {
            topics: Topics.find()
        };
    }
})