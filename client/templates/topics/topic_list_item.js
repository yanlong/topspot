Template.topicListItem.events({
    'click .remove': function(e) {
        e.preventDefault();
        // alert('ffff'+this._id);
        if (confirm('确定删除？'))
            Topics.remove(this._id);
    },
    'click .topic-close': function(e) {
        e.preventDefault();
        // alert('ffff'+this._id);
        if (confirm('结束话题后会自动为用户结算【点劵】，且不能重新开启话题，确定结束？'))
            Topics.update(this._id, {$set: {status:'close'}});
    }
})
Template.topicListItem.helpers({
    // types: Schemas.topic,
})