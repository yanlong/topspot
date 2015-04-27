Topics = new Mongo.Collection('topics');
Bets = new Mongo.Collection('bets');
Prices = new Mongo.Collection('prices');
Comments = new Mongo.Collection('comments');
Favors = new Mongo.Collection('favors');
Follows = new Mongo.Collection('follows');

if (Meteor.isServer) {
    // Create indexes
    Topics._ensureIndex({user:1, mtime: 1});
    // Topics._ensureIndex({title:'text', subtitle: 'text', desc: 'text', abstract: 'text'});
    Bets._ensureIndex({topic:1, mtime: -1});
    Prices._ensureIndex({topic:1, mtime: -1});
    Comments._ensureIndex({topic:1, mtime: 1});
    Favors._ensureIndex({comment:1, mtime: 1});
    Follows._ensureIndex({user:1, mtime: 1});
    Follows._ensureIndex({target:1, mtime: 1});
    Follows._ensureIndex({user:1, target: 1}, {unique: true});

    var Models = {
    	Topics: Topics,
    	Bets: Bets,
    	Prices: Prices,
    	Comments: Comments,
        Favors: Favors,
    	Follows: Follows,
    }


    _.each(Models, function (v, k) {
    	global[k].before.insert(beforeInsert);
    	global[k].before.update(beforeUpdate);
    })

    function beforeInsert(userId, doc) {
        var now = Date.now();
        doc.ctime = now;
        doc.mtime = now;
    }

    function beforeUpdate(userId, doc, fieldNames, modifier ) {
    	var now = Date.now();
        if (!hasUpdateOperator(modifier)) {
            modifier.mtime = now;
        } else {
            modifier.$set = modifier.$set || {};
            modifier.$set.mtime = now;
        }
    }
}

Prices.current = function (topic) {
    var current = Prices.last(topic);
    current = current.fetch()[0] || {};
    return current.price === undefined ? 50 : current.price; // default price
}

Prices.last = function (topic) {
    var topicId = typeof topic === 'object' ? topic._id : topic;
    return Prices.find({topic:topicId}, {sort:{mtime: -1}, limit:1});
}

function hasUpdateOperator(fields) {
    for (var key in fields) {
        if (key.charAt(0) === '$') {
            return true;
        }
    }
    return false;
}
