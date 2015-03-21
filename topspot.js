if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault('counter', 0);

  Template.hello.helpers({
    counter: function () {
      return Session.get('counter');
    }
  });

  Template.hello.events({
    'click button': function () {
      // increment the counter when button is clicked
      Session.set('counter', Session.get('counter') + 1);
    },
    'click button.create': function () {
    Topics.insert({title: 'abc'});
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
    init();
  });
}

Topics = new Mongo.Collection('topics');

function init() {
  if (Topics.find().count() ==0 ) {
    Topics.insert({title: 'abc'});
  }
}
