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
Router.route('/topic/add', {
    name: 'addTopic'
})
Router.route('/topics', {
    name: 'topicList',
    waitOn: function () {
      return Meteor.subscribe('topics')
    },
    data: function () {
      return {topics:Topics.find()};
    }
})
