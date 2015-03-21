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
    name: 'index'
})
Router.route('/topic/add', {
    name: 'addTopic'
})