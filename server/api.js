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
    // Restivus.addCollection(Bets, {
    //     routeOptions: {
    //         // authRequired: true,
    //         // roleRequired: 'admin'
    //     },
    //     endpoints: {
    //         getAll: {
    //             // authRequired: true,
    //             // roleRequired: 'admin'
    //         },
    //         get: {
    //             // authRequired: true,
    //             // roleRequired: 'admin'
    //         }
    //     }
    // });
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
        }),
        post: resp(function () {
            var selector = {
                topic: this.params.topicId,
            }
            return insert.call(this, Comments, selector);
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
        }),
        post: resp(function () {
            var selector = {
                comment: this.params.commentId,
            };
            return insert.call(this, Favors, selector);
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
    Restivus.addRoute('follows/:followId?', {}, {
        get: resp(function () {
            var query = {
                user: 1,
                target: 1,
            }
            return layerRoute.call(this, Follows, 'followId', {
            }, query, null);
        }),
        post: resp(function() {
            check(this.bodyParams, {
                user: String,
                target: String,
            })
            return insert.call(this, Follows, this.bodyParams, {});
        }),
        delete: resp(function() {
            return Follows.remove(this.params.followId);
        })
    })
    Restivus.addRoute('friends', {}, {
        get: resp(function () {
            var user = this.userId || this.queryParams.user;
            var followers = Follows.find({target: user}).fetch();
            var following = Follows.find({user: user}).fetch();
            var friends = _.intersection(_.map(followers, function (v) {
                return v.user;
            }), _.map(following, function (v) {
                return v.target
            }))
            return Meteor.users.find({_id:{$in:friends}}).fetch();
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
    Restivus.addRoute('bets/', {}, {
        get: resp(function() {
            var selector = {
                user: this.userId || this.queryParams.user, // fortest
            }
            var query = {
                attitude: null,
                status: null,
                topic: null,
            }
            // return selector;
            return getAll.call(this, Bets, selector, query);
        })
    })

    Restivus.addRoute('catalogs/', {}, {
        get: resp(function() {
            return Consts.catalogs;
        })
    })
    Restivus.addRoute('rank/', {}, {
        get: resp(function() {
            // return Rank.day(Date.now());
            return moment().format('YYYY-MM-DD');
        })
    })
    Restivus.addRoute('rankings/:rankingId?', {}, {
        get: resp(function() {
            var query = {
                type: 1,
                date: 1,
                ctime: 1,
                mtime: 1,
                catalog: 1,
            }
            var option = {
                fields: query
            }
            var rank = layerRoute.call(this, Rankings, 'rankingId', {
            }, query, option);
            if (this.params.rankingId) {
                rank.list = populate('user', rank.list);
            }
            return rank;
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
        code = ('000000' + Math.floor(Math.random() * 1e6)).slice(-6);
        Sms.send(phone, code);
        cache[phone] = code;
        return code;
    }
}

function layerRoute(collection, id, selector, query, option) {
    option = option || {};
    var self = this;
    var data = null;
    _.each(selector, function(v, k) {
        selector[k] = self.params[v];
    })
    var id = this.params[id];
    if (id) {
        selector._id = id;
        data = collection.findOne(selector); // TODO: support
    } else {
        data = getAll.call(this, collection, selector, query, option)
    }
    return data;
}

function getAll(collection, selector, query, option) {
    selector = selector || {};
    option = option || {};
    var optionKeys = {
        // sort: 'mtime',
        limit: 20,
        skip: 0,
    };
    var self = this
    _.each(optionKeys, function(v, k) {
        if (self.queryParams[k]) {
            optionKeys[k] = parseInt(self.queryParams[k]);
        }
    })
    // option support
    _.extend(option, optionKeys);
    var query = _.reduce(query, function(memo, v, k) {
        if (self.queryParams[k]) {
            memo[k] = self.queryParams[k];
        }
        return memo;
    }, {})
    var search = {};
    // Support text search
    if (this.queryParams._wd) {
        search = [];
        var reg = new RegExp(this.queryParams._wd);
        ['title', 'subtitle', 'desc'].forEach(function (v) {
            var s = {};
            s[v] = reg;
            search.push(s)
        })
        search = {$or: search}
    }
    // Support sort by field
    ['_desc', '_asc'].forEach(function (v) {
        option.sort = option.sort|| {};
        option.sort[self.queryParams[v]] = v == '_desc' ? -1: 1;
    })
    selector = _.extend(selector, query, search);
    var records = collection.find(selector, option).fetch();
    if (this.queryParams._distinct) {
        var key = this.queryParams._distinct;
        var data = {};
        records.forEach(function (r) {
            data[r[key]] = true;
        })
        var distincted = _.map(data, function (v,k) {
            var ret = {}
            ret[key] = k;
            return ret;
        })
        if (this.queryParams._populate) {
            return populate(key, distincted)
        } 
        return distincted;
    } else {
        if (this.queryParams._populate) {
            return populate(this.queryParams._populate, records)
        }
        return records;
    }
}

function populate(key, docs) {
    docs = docs || [];
    var ids = _.map(docs, function (v) {
        return v[key];
    })
    var map = {};
    Models[key].find({_id: {$in: ids}}).forEach(function (v) {
        map[v._id] = v;
    })
    docs.forEach(function (v) {
        v[key] = map[v[key]];
    })
    // TODO: filter secret fileds
    return docs;
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


