// API must be configured and built after startup!
var useAuth = true;
Meteor.startup(function() {
    // Global configuration
    Restivus.configure({
        useAuth: true
    });
    Restivus.addCollection(Meteor.users, {routeOptions:{
        authRequired: true,
    }});
    Restivus.addRoute('topics/:topicId?', {}, {
        get: {
            action: resp(function() {
                var query = {
                    user: null,
                    status: null,
                    title: null,
                    subtitle: null,
                    tags: null,
                    catalog: null,
                    subcatalog: null,
                }
                var topics = layerRoute.call(this, Topics, 'topicId', null, query);

                return pullRank(topics);
            })
        }
    });
    Restivus.addRoute('topics/:topicId/bets/:betId?', {
        authRequired: useAuth,
    }, {
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
                user: this.userId,
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
                user: this.userId,
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
    Restivus.addRoute('topics/:topicId/comments/:commentId?', {
        authRequired: useAuth,
    }, {
        get: resp(function() {
            var query = {
                user: null,
            }
            var ret = layerRoute.call(this, Comments, 'commentId', {
                topic: 'topicId'
            }, query);
            var collection = _.isArray(ret) ? ret : [ret];
            var self = this;
            collection.forEach(function (v) {
                v.nFavors = Favors.find({type:'comment', comment:v._id}).count();
                var favored = Favors.findOne({type:'comment', comment:v._id, user:self.userId});
                v.favored = favored && favored._id;
            })
            return ret;
        }),
        post: {
            authRequired: useAuth,
            action: resp(function () {
                var selector = {
                    topic: this.params.topicId,
                }
                return insert.call(this, Comments, selector);
            })
        }
    })
    Restivus.addRoute('topics/:topicId/comments/:commentId/favors/:favorId?', {
        authRequired: useAuth,
    }, {
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
                type: 'comment',
                user: this.userId,
            };
            return insert.call(this, Favors, selector, {}, {}, true);
        })
    })
    Restivus.addRoute('topics/:topicId/favors/:favorId?', {
        authRequired: useAuth,
    }, {
        get: resp(function() {
            var query = {
            }
            var selector = {
                user: this.queryParams.user || this.userId,
                topic: 'topicId',
            }
            return layerRoute.call(this, Favors, 'favorId', selector, query);
        }),
        post: resp(function () {
            var selector = {
                topic: this.params.topicId,
                user: this.userId,
                type: 'topic',
            };
            check(selector, {
                topic: String,
                user: String,
                type: 'topic',
            })
            return insert.call(this, Favors, selector, null, null, true);
        })
    })
    Restivus.addRoute('favors/:favorId?', {
        authRequired: useAuth,
    }, {
        get: resp(function() {
            var selector = {
                user: this.queryParams.user || this.userId,
            };
            var query = {
                type: 1,
                topic:1,
                comment:1,
            }
            return layerRoute.call(this, Favors, 'favorId', selector, query);
        }),
        delete: resp(function() {
            var selector = {
                _id: this.params.favorId,
                user: this.userId,
            }
            return Favors.remove(selector);
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
            var rank = Rankings.findOne({type:'topic', topic: topic}, {sort:{mtime:-1}}) || {};
            rank.list = populateUser(rank.list||[]);
            if (this.queryParams.user) {
                var my = null;
                for (var k in rank.list) {
                    var v = rank.list[k]
                    if (v.user._id == this.queryParams.user) {
                        my = v;
                        break;
                    }
                }
                rank.my = my;
            }
            rank.list = rank.list.slice(0,top);
            return rank;
        })
    })
    Restivus.addRoute('followers', {
        authRequired: useAuth,
    }, {
        get: resp(function() {
            var user = this.queryParams.user || this.userId;
            var selector = {
                target: user
            }
            var followers = getAll.call(this, Follows, selector, {});
            var selector = {
                user: user,
                target: {$in: followers.map(function (v) {return _.isObject(v.user) ? v.user._id : v.user})},
            };
            var following = Follows.find(selector,{target:1}).fetch();
            following = _.reduce(following, function (memo, v) {
                memo[v.target] = v._id;
                return memo;
            }, {});
            followers.forEach(function (v) {
                v.friend = following[_.isObject(v.user) ? v.user._id : v.user];
            })
            return followers;
        })
    })
    Restivus.addRoute('following', {
        authRequired: useAuth,
    }, {
        get: resp(function() {
            var user = this.queryParams.user || this.userId;
            var selector = {
                user: user,
            }
            var following = getAll.call(this, Follows, selector, {});
            var selector = {
                target: user,
                user: {$in: following.map(function (v) {return _.isObject(v.target) ? v.target._id : v.target})},
            };
            var followers = Follows.find(selector,{user:1}).fetch();
            followers = _.reduce(followers, function (memo, v) {
                memo[v.user] = v._id;
                return memo;
            }, {});
            following.forEach(function (v) {
                v.friend = followers[_.isObject(v.target) ? v.target._id : v.target];
            })
            return following;
        })
    })
    Restivus.addRoute('follows/:followId?', {
        authRequired: useAuth,
    }, {
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
            // TODO: check user exists.
            var doc = {
                user: this.userId,
                target: this.bodyParams.target,
            }
            return insert.call(this, Follows, doc, {}, null, true);
        }),
        delete: resp(function() {
            var selector = {
                user: this.userId,
                _id: this.params.followId,
            }
            return Follows.remove(selector);
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
            friends = friends.map(function (v) {
                return {user:v};
            })
            return populateUser(friends);
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
            // TODO: time limit
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
    Restivus.addRoute('bets/:betId?', {
        authRequired: useAuth,
    }, {
        get: resp(function() {
            var selector = {
                user: this.queryParams.user || this.userId,
            }
            var query = {
                attitude: null,
                status: null,
                topic: null,
            }
            return layerRoute.call(this, Bets, 'betId', selector, query);
        })
    })
    Restivus.addRoute('credits/:creditId?', {
        authRequired: useAuth,
    }, {
        get: resp(function() {
            var selector = {
                user: this.userId,
            }
            var query = {
                type: null,
                topic: null,
                ranking: null,
                source: null,
            }
            return layerRoute.call(this, Credits, 'creditId', selector, query);
        })
    })

    Restivus.addRoute('fortune/', {
        authRequired: useAuth,
    }, {
        get: resp(function() {
            var user = this.queryParams.user || this.userId;
            return {
                scores: total(user) - FortuneHistory.findOne({user: user}, {sort: {mtime:-1}}).fortune.scores,
            };
        })
    })
    Restivus.addRoute('test/', {}, {
        get: resp(function() {
            // return Rank.day(Date.now());
            return moment().format('YYYY-MM-DD');
        })
    })
    Restivus.addRoute('catalogs/', {}, {
        get: resp(function() {
            return Consts.catalogs;
        })
    })
    Restivus.addRoute('followcounts/', {
        authRequired: useAuth,
    }, {
        get: resp(function() {
            var user = this.queryParams.user || this.userId;
            return {
                followers: Follows.find({target:user}).count(),
                following: Follows.find({user:user}).count(),
            };
        })
    })
    Restivus.addRoute('relationship/', {
        authRequired: useAuth,
    }, {
        get: resp(function() {
            var user = this.queryParams.user || this.userId;
            var target = this.queryParams.target;
            var follower = Follows.findOne({target:user, user:target});
            var following = Follows.findOne({user:user, target:target});
            return {
                follower:  follower && follower._id,
                following: following && following._id,
            };
        })
    })
    Restivus.addRoute('feedbacks/:feedbackId?', {
        authRequired: true,
    }, {
        get: resp(function() {
            var selector = {
                user: this.userId,
            }
            var query = {
            }
            return layerRoute.call(this, Feedbacks, 'feedbackId', selector, query);
        }),
        post: resp(function () {
            check(this.bodyParams, {
                os: String,
                device: String,
                version: String,
                contact: String,
                content: String,
            })
            var selector = this.bodyParams;
            var defualts = {
                user: this.userId,
            };
            var override = {
            }
            return insert.call(this, Feedbacks, selector, defualts, override);
        })
    })
    Restivus.addRoute('rankings/:rankingId?', {}, {
        get: resp(function() {
            var self = this;
            var query = {
                type: 1,
                date: 1,
                catalog: 1,
                topic: 1,
            }
            var option = {
                fields: {list:0},
            }
            if (this.params.rankingId||this.queryParams.user) {
                option = null;
            }
            var rank = layerRoute.call(this, Rankings, 'rankingId', {
            }, query, option);
            if (!this.params.rankingId && this.queryParams.user) {
                rank.forEach(function (v) {
                    v.list = _.reduce(v.list, function (memo, v) {
                        if (v.user == self.queryParams.user) {
                            memo.push(v);
                        }
                        return memo;
                    }, []);
                })
            }
            if (this.params.rankingId) {
                rank.list = populateUser(rank.list);
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
    selector = selector || {};
    var self = this;
    var data = null;
    _.each(selector, function(v, k) {
        selector[k] = self.params[v] || v; // WARNING: hack! Support both ids map and key-value map;
    })
    var id = this.params[id];
    if (id) {
        data = getAll.call(this, collection, {_id:id}, null, option)
        data = data && data[0];
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
        ['title', 'subtitle'].forEach(function (v) {
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
    _.each(selector, function (v, k) {
        if (_.isString(v) && v.split(',').length > 1) {
            selector[k] = {$in: v.split(',')}
        }
    })
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

function populate(key, docs, option) {
    var res = [];
    key.split(',').forEach(function (v) {
        res = _populate(v, docs, option);
    })
    return res;
}

function _populate(key, docs, option) {
    var modelMap = {
        target: 'user',
    }
    docs = docs || [];
    var ids = _.map(docs, function (v) {
        return v[key];
    })
    var map = {};
    option = option || {};

    var model = Models[key] || Models[modelMap[key]];
    // TODO: filter secret fileds
    if (model === Meteor.users) {
        option = {fields: {services:0, 'profile.phone':0, fortune:0, emails:0}};
    }
    model.find({_id: {$in: ids}}, option).forEach(function (v) {
        map[v._id] = v;
    })
    docs.forEach(function (v) {
        v[key] = map[v[key]];
    })
    return docs;
}

function populateUser(docs) {
    docs = populate('user', docs);
    return docs;
}

function insert(collection, selector, defualts, override, upsert) {
    var data = {};
    defualts = defualts || {};
    override = override || {};
    _.extend(data, defualts, this.bodyParams, selector, override);
    if (upsert) {
        var res = collection.update(data, data, {upsert:true})
        return collection.findOne(data);
    } else {
        var id = collection.insert(data);
        return collection.findOne(id)
    }
}

function update(collection, id, selector, defualts, override) {
    var data = {};
    defualts = defualts || {};
    override = override || {};
    _.extend(data, defualts, this.bodyParams, selector, override);
    collection.update(id, {$set: data});
    return collection.findOne(id)
}

function total(user) {
    var bets = Bets.find({user: user, status: 'open'}).fetch();
    bets = populate('topic', bets);
    var floating = _.reduce(bets, function (memo,v) {
        return memo + profit(v, v.topic);
    }, 0);
    var scores = base(user)
    return scores + floating;
}

function base(user) {
    var u = Meteor.users.findOne(user);
    var scores = u.fortune ? u.fortune.scores : 0;
    return scores;
}

function profit(bet, topic) {
    var close = topic ? (typeof topic === 'object' ? topic.price : topic) : bet.close;
    var open = bet.open;
    var delta = close - open;
    return bet.attitude == 'postive' ? delta : -delta;
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

function pullRank(topics) {
    // return topics
    var collection = _.isArray(topics) ? topics : [topics];
    collection.forEach(function (topic) {
        topic.ranking = Rankings.findOne({topic:topic._id, type:'topic'}, {sort:{mtime:-1}}) || [];
        if (topic.ranking.list) {
            topic.ranking.list = topic.ranking.list.slice(0,1);
            topic.ranking.list = populateUser(topic.ranking.list);
        }
    })
    return topics;
}

Api= {
    total: total,
    base: base,
    profit: profit,
};
