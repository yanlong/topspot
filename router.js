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
    name: 'hello'
})
Router.route('/topic/add', {
    name: 'addTopic'
})