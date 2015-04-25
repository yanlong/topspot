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
                action: resp(function() {
                    var query = {
                        user: null,
                        status: 'open',
                        title: null,
                        subtitle: null,
                        tags: null,
                        catalog: null,
                        subcatalog: null,
                    }
                    var topics = getAll.call(this, Topics, null, query);
                    return topics;
                })
            },
            get: {
                // authRequired: true,
                // roleRequired: 'admin'
            },
            post: {
                // authRequired: true,
                action: resp(function() {
                    var selector = {
                        user: this.userId,
                    }
                    return insert.call(this, Topics, selector);
                })
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
        get: resp(function() {
            var query = {
                user: null,
                status: null,
            }
            return layerRoute.call(this, Bets, 'betId', {
                topic: 'topicId'
            }, query);
        }),
        post: resp(function() {
            check(this.bodyParams, {
                user: String,
                attitude: Match.OneOf('postive', 'negtive'),
            })
            var selector = {
                // user: this.userId, // fortest
                topic: this.params.topicId,
            }
            var defualts = {
            };
            var override = {
                status: 'open',
                open: Prices.current(selector.topic),
            }
            return insert.call(this, Bets, selector, defualts, override);
        }),
        put: resp(function () {
            check(this.bodyParams, {
            });
            var selector = {
                // user: this.userId, // fortest
                topic: this.params.topicId,
            }
            var defualts = {
            };
            var override = {
                status: 'close',
                close: Prices.current(selector.topic),
            }
            return update.call(this, Bets, this.params.betId, selector, defualts, override);
        })
    })
    Restivus.addRoute('topics/:topicId/comments/:commentId?', {}, {
        get: resp(function() {
            var query = {
                user: null,
            }
            return layerRoute.call(this, Comments, 'commentId', {
                topic: 'topicId'
            }, query);
        })
    })
    Restivus.addRoute('topics/:topicId/comments/:commentId/favors/:favorId?', {}, {
        get: resp(function() {
            var query = {
                user: null,
            }
            return layerRoute.call(this, Favors, 'favorId', {
                // topic: 'topicId',
                comment: 'commentId',
            }, query);
        })
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
        get: resp(function() {
            var top = this.queryParams.top || 10;
            var topic = this.params.topicId;
            var current = Prices.current(topic);
            var counter = {}
            Bets.find({
                topic: topic
            }, {
                limit: 10000,
                sort: {
                    mtime: -1
                }
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
            return tops;
        })
    })
    Restivus.addRoute('followers', {}, {
        get: resp(function() {
            var selector = {
                target: this.userId || this.queryParams.user, // fortest
            }
            return getAll.call(this, Follows, selector, {});
        })
    })
    Restivus.addRoute('following', {}, {
        get: resp(function() {
            var selector = {
                user: this.userId || this.queryParams.user, // fortest
            }
            return getAll.call(this, Follows, selector, {});
        })
    })
    Restivus.addRoute('register', {}, {
        post: resp(function() {
            check(this.bodyParams, {
                username: String,
                phone: String,
                password: String,
                code: String,
            })
            phoneVerify(this.bodyParams.phone, this.bodyParams.code);
            this.bodyParams.profile = {
                phone: this.bodyParams.phone,
            }
            // check phone number is unique
            var count = Meteor.users.find({'profile.phone': this.bodyParams.phone}).count();
            if (count != 0) {
                throw new Meteor.Error('Phone not unique');
            }
            delete this.bodyParams.phone
            return Accounts.createUser(this.bodyParams);
        })
    })
    Restivus.addRoute('phone/verify', {}, {
        get: resp(function () {
            check(this.queryParams, {
                phone: String,
                code: Match.Optional(String),
            })
            return phoneVerify(this.queryParams.phone, this.queryParams.code);
        })
    })
    Restivus.addRoute('password/reset', {}, {
        get: resp(function () {
            check(this.queryParams, {
                phone: String,
                code: String,
                password: String,
            })
            phoneVerify(this.queryParams.phone, this.queryParams.code);
            var user = Meteor.users.findOne({'profile.phone': this.queryParams.phone});
            Accounts.setPassword(user._id, this.queryParams.password);
        })
    })


});

var cache = {};

function phoneVerify(phone, code) {
    if (code) {
        if (cache[phone] != code) {
            throw new Meteor.Error('Phone verify failed.');
        } else {
            cache[phone] = null;
        }
    } else {
        cache[phone] = Math.floor((Math.random() * 1e6 + 1e5));
        return cache[phone];
    }
}

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
    return data;
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

function insert(collection, selector, defualts, override) {
    var data = {};
    defualts = defualts || {};
    override = override || {};
    _.extend(data, defualts, this.bodyParams, selector, override);
    var id = collection.insert(data);
    return collection.findOne(id)
}

function update(collection, id, selector, defualts, override) {
    var data = {};
    defualts = defualts || {};
    override = override || {};
    _.extend(data, defualts, this.bodyParams, selector, override);
    collection.update(id, {$set: data});
    return collection.findOne(id)
}

function resp(fn) {
    return function() {
        var data = fn.call(this);
        return {
            status: 'success',
            data: data,
        }
    }
}
