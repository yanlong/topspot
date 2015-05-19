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
            // Meteor.subscribe('latestBets', this.params._id, 10),
        ]
    },
    data: function() {
        var topic = Topics.findOne(this.params._id);
        var other = {
            last: Prices.current(this.params._id)
        }
        var ext = [{
            name: 'last',
            label: '当前价格',
        }, {
            name: 'status',
            label: '状态',
        }];
        ['begin','end'].forEach(function (v) {
            topic[v] = Utils.timestamp2datetime(topic[v]);
        })
        return {data:_.extend(topic||{}, other), types: ext.concat(Schemas.topic)};
    }
})

Router.route('/topics/:_id/edit', {
    name: 'topicEdit',
    waitOn: function() {
        return [
            Meteor.subscribe('singleTopic', this.params._id),
            Meteor.subscribe('currentPrice', this.params._id),
            // Meteor.subscribe('latestBets', this.params._id, 10),
        ]
    },
    data: function() {
        var topic = Topics.findOne(this.params._id);
        var other = {
            last: Prices.current(this.params._id)
        }
        var ext = [{
            name: 'last',
            label: '当前价格',
        }, {
            name: 'status',
            label: '状态',
        }];
        ['begin','end'].forEach(function (v) {
            topic[v] = Utils.timestamp2datetime(topic[v]);
        })

        return {data:_.extend(topic||{}, other), types: ext.concat(Schemas.topic)};
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