## 分类统计慢查询
```
db['system.profile'].group({
    key: {
        op: 1
    },
    initial: {count:0, total:0},
    $reduce: function(doc, memo) {
        memo.count++;
        memo.total += doc.millis;
        return memo;
    },
    finalize: function (result) {
        result.avg = result.total / result.count;
        return result;
    }
})
```

## reset db
['bets', 'prices', 'comments', 'favors', 'follows', 'rankings'].forEach(function (v) {
    db[v].drop();
})

## restore user scores
function restoreFortune(user) {
    var count = 0;
    db.bets.find({status:'close',user:user}).forEach(function (doc) {
        var delta = doc.close - doc.open;

        count += doc.attitude == 'postive' ? delta : -delta;
    })
    db.users.update({_id:user}, {$set:{'fortune.scores': count}});
}

## update date of rankings
function updateDayRankings() {
    db.rankings.find({
        type: 'day'
    }).forEach(function(v) {
        var right = new Date(new Date(v.date) - 1000 * 60 * 60 * 24);
        var day = right.getDate();
        var mon = ('0' + (right.getMonth() + 1)).slice(-2);
        var date = '2015-' + mon + '-' + day;
        print(v.date, '->', date);
        db.rankings.update({
            _id: v._id
        }, {
            $set: {
                date: date
            }
        });
    })
}

## profiling data group
db.system.profile.group({key:{'ns':1,'op':1}, reduce:function (doc, memo) {memo.count++;return memo;},initial: {count:0}}
