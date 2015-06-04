Template.topicListItem.events({
    'click .remove': function(e) {
        e.preventDefault();
        if (confirm('确定删除？'))
            Topics.update(this._id, {$set:{status:'deleted'}});
    },
    'click .topic-close': function(e) {
        e.preventDefault();
        if (confirm('结束话题后会自动为用户结算【点劵】，且不能重新开启话题，确定结束？')) {
            var val = parseInt($(e.target).html());
            Topics.update(this._id, {$set: {status:'close', price: val}});
        }
    }
})
Template.topicListItem.helpers({
    isOpen: function () {
        return this.status !== 'close';
    }
})