Items = new Mongo.Collection('items');
// Topics = new Mongo.Collection('topics');

if (Meteor.isServer) {

    // API must be configured and built after startup!
    Meteor.startup(function() {

        // Global configuration
        Restivus.configure({
            useAuth: true
        });


        Restivus.addCollection(Meteor.users);

        Restivus.addCollection(Topics, {
            routeOptions: {
                // authRequired: true,
                // roleRequired: 'admin'
            },
            endpoints: {
                getAll: {
                    // authRequired: true,
                    // roleRequired: 'admin'

                },
                get: {
                    // authRequired: true,
                    // roleRequired: 'admin'
                }
            }
        });
        Restivus.addCollection(Bets, {
            routeOptions: {
                // authRequired: true,
                // roleRequired: 'admin'
            },
            endpoints: {
                getAll: {
                    // authRequired: true,
                    // roleRequired: 'admin'

                },
                get: {
                    // authRequired: true,
                    // roleRequired: 'admin'
                }
            }
        });
        Restivus.addRoute('topics/:topicId/bets/:betId?', {}, {
            get: function() { 
                var option = {
                    topic: this.params.topicId,
                }
                var id = this.params.betId;
                if (id) {
                    option._id = id;
                    return Bets.findOne(option);
                } 
                return Bets.find(option).fetch();
            }
        })
    });
}