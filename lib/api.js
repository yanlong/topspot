Router.route('/api/topics/:id?', {where: 'server'})
.get(function () {
    var id = this.params.id
    var topic = id ? Topics.findOne({_id:id}) : Topics.find().fetch();
    if (!topic) {
        throw new Meteor.Error('No such topic, id:'+id)
    }
    this.response.end(JSON.stringify(topic));
})
.post(function () {
    this.response.end('post request\n');
});

