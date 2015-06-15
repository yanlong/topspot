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
    },
    'click .changePrice': function (e) {
        e.preventDefault();
        var changed = parseInt(prompt('输入修改后的价格：', '-97 ~ 97'));
        console.log(changed);
        if (!isNaN(changed)) {
            Topics.update(this._id, {$set: {price: changed}});
        }
    }
})
Template.topicListItem.helpers({
    isOpen: function () {
        return this.status !== 'close';
    },
    expires: function () {
        if (this.status == 'open' && Date.now() + 10 * 60 *1000 > this.end) {
            return 'color:red;';
        }
        return '';
    }
})