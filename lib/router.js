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
        ];
    },
    data: function() {
        var topic = Topics.findOne(this.params._id) || {}; 
        var ext = [{
            name: 'price',
            label: '当前价格',
        }, {
            name: 'status',
            label: '状态',
        }];
        ['begin','end'].forEach(function (v) {
            topic[v] = Utils.timestamp2datetime(topic[v]);
        })
        return {data: topic, types: ext.concat(Schemas.topic)};
    }
})

Router.route('/topics/:_id/edit', {
    name: 'topicEdit',
    waitOn: function () {
        return Meteor.subscribe('singleTopic', this.params._id);
    },
    data: function() {
        var topic = Topics.findOne(this.params._id) || {};
        var ext = [{
            name: 'price',
            label: '当前价格',
        }, {
            name: 'status',
            label: '状态',
        }];
        ['begin','end'].forEach(function (v) {
            topic[v] = Utils.timestamp2datetime(topic[v]);
        })

        return {data:topic, types: ext.concat(Schemas.topic)};
    }
})

Router.route('/topics', {
    name: 'topicList',
    waitOn: function() {
        return Meteor.subscribe('topics')
    },
    data: function() {
        return {
            topics: Topics.find({status: {$ne:'deleted'}})
        };
    }
})

Router.route('/users', {
    name: 'userList',
    waitOn: function() {
        return Meteor.subscribe('users')
    },
    data: function() {
        return {
            users: Meteor.users.find()
        };
    }
})

var requireLogin = function() {
  if (! Meteor.user()) {
    if (Meteor.loggingIn()) {
      this.render(this.loadingTemplate);
    } else {
      this.render('accessDenied');
    }
  } else if (!Roles.userIsInRole(Meteor.userId(), ['editor', 'admin'])) {
      this.render('accessDenied');
  } else {
    this.next();
  }
}

if (Meteor.isClient) {
  Router.onBeforeAction('dataNotFound');
  Router.onBeforeAction(requireLogin);
}