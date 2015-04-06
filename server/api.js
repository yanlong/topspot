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
                action: function() {
                    var query = {
                        user: null,
                        status: 'open',
                        title: null,
                        subtitle: null,
                    }
                    var topics = getAll.call(this, Topics, null, query);
                    return {
                        status: 'success',
                        data: topics
                    };
                }

            },
            get: {
                // authRequired: true,
                // roleRequired: 'admin'
            },
            post: {
                // authRequired: true,
                action: function() {
                    var selector = {
                        user: this.userId,
                    }
                    return insert.call(this, Topics, selector);
                }
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
            var query = {
                user: null,
                status: null,
            }
            return layerRoute.call(this, Bets, 'betId', {
                topic: 'topicId'
            }, query);
        },
        post: function() {
            var selector = {
                user: this.userId,
                topic: this.params.topicId,
            }
            return insert.call(this, Bets, selector);
        }
    })
    Restivus.addRoute('topics/:topicId/comments/:commentId?', {}, {
        get: function() {
            var query = {
                user: null,
            }
            return layerRoute.call(this, Comments, 'commentId', {
                topic: 'topicId'
            }, query);
        }
    })
    Restivus.addRoute('topics/:topicId/comments/:commentId/favors/:favorId?', {}, {
        get: function() {
            var query = {
                user: null,
            }
            return layerRoute.call(this, Favors, 'favorId', {
                // topic: 'topicId',
                comment: 'commentId',
            }, query);
        }
    })

    Restivus.addRoute('topics/:topicId/ticker/', {}, {
        get: function() {
            return {
                last: Prices.current(this.params.topicId),
                date: Date.now()
            };
        }
    })
    Restivus.addRoute('topics/:topicId/rank/', {}, {
        get: function() {
            var top = this.queryParams.top || 10;
            var topic = this.params.topicId;
            var current = Prices.current(topic);
            var counter = {}
            Bets.find({
                topic: topic
            }).forEach(function(doc, index) {
                var user = doc.user;
                if (!counter[user]) counter[user] = 0;
                counter[user] += (doc.close || current) - doc.open;
            })
            var scores = _.map(counter, function(v, k) {
                return {
                    user: k,
                    scores: v
                };
            })
            var tops = _.sortBy(scores, 'scores').slice(-top).reverse().map(function(v) {
                v.user = Meteor.users.findOne(v.user);
                delete v.user.services;
                return v;
            });
            return {
                status: 'success',
                data: tops
            };
        }
    })
});

function layerRoute(collection, id, selector, query) {
    var self = this;
    var data = null;
    _.each(selector, function(v, k) {
        selector[k] = self.params[v];
    })
    var id = this.params[id];
    if (id) {
        selector._id = id;
        data = collection.findOne(selector);
    } else {
        data = getAll.call(this, collection, selector, query)
    }
    return {
        status: 'success',
        data: data
    };
}

function getAll(collection, selector, query) {
    selector = selector || {};
    var option = {
        // sort: 'mtime',
        limit: 20,
        skip: 0,
    };

    var self = this
    _.each(option, function(v, k) {
        if (self.queryParams[k]) {
            option[k] = parseInt(self.queryParams[k]);
        }
    })
    var query = _.reduce(query, function(memo, v, k) {
        if (self.queryParams[k]) {
            memo[k] = self.queryParams[k];
        }
        return memo;
    }, {})
    selector = _.extend(selector, query);
    return collection.find(selector, option).fetch()
}

function insert(collection, selector) {
    var data = this.bodyParams;
    _.extend(data, selector);
    var id = collection.insert(data);
    return {
        status: 'success',
        data: collection.findOne(id)
    };
}