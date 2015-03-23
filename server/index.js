Items = new Mongo.Collection('items');
// Topics = new Mongo.Collection('topics');

if (Meteor.isServer) {

    // API must be configured and built after startup!
    Meteor.startup(function() {

        // Global configuration
        Restivus.configure({});


        Restivus.addCollection(Topics);
    });
}