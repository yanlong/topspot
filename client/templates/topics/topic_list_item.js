Template.topicListItem.events({
    'click .remove': function(e) {
        e.preventDefault();
        // alert('ffff'+this._id);
        if (confirm('确定删除？'))
            Topics.remove(this._id);
    }
})
Template.topicListItem.helpers({
    // types: Schemas.topic,
})