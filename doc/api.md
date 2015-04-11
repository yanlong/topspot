版本：v0.5

# 1、概述

系统输出一套RESTful风格的HTTP API供客户端调用，以实现对系统中各种资源（实体、模型）的列举、查询、新增、修改、删除操作。

# 2、接口描述
## 系统中的主要资源有：
用户 users
话题 topics
投注 bets
评论 comments
赞 favors

## 接口调用规则如下：

`${method} /api/${model}/${id}?`

其中:

```
${method} 值为GET（列举、查询）、新增（POST）、修改（PUT）、删除（DELETE）
${model} 值为users、topics、bets
${id} 为资源id，问号（？）表示在列举时需要省略次字段
```

资源查询规则(目前支持查询话题，评论、赞， 查询条件只支持limit、skip)：

```
/${resource_uri}?${field_name}=${field_value}&limit=${value}&skip=${value}
```

新增接口

```
/topics/:topicId/comments/:commentId?
/topics/:topicId/comments/:commentId/favors/favorId?
```

对象字段说明:

通用字段: 

```
{
    _id: 'hoYSbvMeT9aTuQdfD', // 对象唯一id
    ctime: 1427679199613, // 对象创建时间
    mtime: 1427679199613, // 对象修改时间
}
```

话题topic: 

```
{
    _id: "v72LQEx8GKdGocRsR",
    user: "CALgu2z2Hg7e3KTBB", // 话题创建者id
    title: "热门话题#2",
    subtitle: "热门话题副标题2-up-up",
    abstract: "话题摘要",
    desc: "背景描述",
    rule: "规则",
    images: [
    "http://img3.douban.com/view/photo/photo/public/p2203381544.jpg"
    ],
    postive: "正面描述",
    negtive: "反面描述",
    catalog: "分类",
    begin: 13412312312312, // 开始时间
    end: 13412312312312, // 结束时间
    status: "open", // 话题状态，(preopen|open|close)
    ctime: 1427679199739,
    mtime: 1427679199739
}
```
评论comment: 

```
{
    _id: "KKdXYcHr8nf2sBFoX",
    user: "zWKjGApAvk2z6tvpd", // 评论发表者id
    topic: "v72LQEx8GKdGocRsR", // 话题id
    content: "评价内容30",
    replyTo: "", // 回复的话题id，可选
    ctime: 1427679198402,
    mtime: 1427679198402
}
```
点赞favor: 

```
{
    _id: "zGrpNQSFQW7GjouGs",
    user: "zWKjGApAvk2z6tvpd", // 点赞者id
    comment: "KKdXYcHr8nf2sBFoX", // 被点赞评论id
    ctime: 1427679198404,
    mtime: 1427679198404
}
```
下注bet: 

```
{
_id: "j9vZAqNM3MDLjdNMK",
user: "zWKjGApAvk2z6tvpd",
topic: "v72LQEx8GKdGocRsR",
attitude: "postive", // 观点，(postive|negtive)
price: 13, // 下注时话题的价格
status: "open", // 状态, (open|close)
ctime: 1427679198401,
mtime: 1427679198401
}
```

# 3、接口分类
## 普通用户
GET /api/topics 查询话题
POST /api/topics/:id/bets 新增下注
PUT /api/topics/:id/bets/:id 介绍下注

# 4、示例
话题列表：
http://182.92.9.182/api/topics/

话题详情：
http://182.92.9.182/api/topics/bSK7vYkrhibr67X3R/

话题下注列表
http://182.92.9.182/api/topics/bSK7vYkrhibr67X3R/bets

下注详情：
http://182.92.9.182/api/topics/bSK7vYkrhibr67X3R/bets/B5SYboCdjZaKSt77i

根据用户查询话题：
http://182.92.9.182/api/topics?user=6QdswTou4bATXvMnK

根据用户查询并实现分页：
http://182.92.9.182/api/topics?user=6QdswTou4bATXvMnK&limit=3&skip=3

更新话题：
```
curl -X PUT -d '{"_id":"bSK7vYkrhibr67X3R","user":"CALgu2z2Hg7e3KTBB","title":"热门话题#2","subtitle":"热门话题副标题2-up-up","abstract":"话题摘要","desc":"背景描述","catalog":"分类","begin":13412312312312,"end":13412312312312,"status":"ing"}' http://182.92.9.182/api/topics/bSK7vYkrhibr67X3R/ -H 'content-type: application/json'
```


当前价格：

```
GET /api/topics/CKNHTco7Yq9u2jGeK/ticker
{
    last: 518424,
    date: 1428311953127
}
```

当前话题用户积分排名：

```
GET /api/topics/m3msp79GLFN4MRRRk/rank?top=10
{
    "status": "success",
    "data": [{
        "user": {
            "_id": "9xAFhwWuDg53Lwidi",
            "createdAt": "2015-04-06T10:32:32.638Z",
            "emails": [{
                "address": "topspot0@gmail",
                "verified": false
            }]
        },
        "scores": 8221208
    }, {
        "user": {
            "_id": "4XPs3nFWZN4LXRgNu",
            "createdAt": "2015-04-06T10:32:32.759Z",
            "emails": [{
                "address": "topspot1@gmail",
                "verified": false
            }]
        },
        "scores": 7912610
    }, {
        "user": {
            "_id": "vT3Yr2X734zTeGhSk",
            "createdAt": "2015-04-06T10:32:32.862Z",
            "emails": [{
                "address": "topspot2@gmail",
                "verified": false
            }]
        },
        "scores": 7437879
    }]
}
```

用户关注与被关注接口：
```
GET /api/(followers|following)?user=JsEstjX8g94GiSbM2
{
    status: "success",
    data: [
        {
            _id: "Eg4ymCsJptFNRWBiW",
            user: "T7tytgbbSM4fFDcBa",
            target: "JsEstjX8g94GiSbM2"
            },
        {
            _id: "Pm4fF5ioTRAP7MtmK",
            user: "wDzH4WoycWMoWu7Ms",
            target: "JsEstjX8g94GiSbM2"
        }
    ]
}
```

下注接口：

```
POST /api/topics/:topicId/bets
{
    user: "E2oySNPQzq2wx3RHg", // 测试使用
    attitude: "negtive"
}
```

结束下注接口：

```
PUT /api/topics/:topicId/bets/:betId
{

}
```

下注和结束下注示例：

```
[yanlong@yandeMacBook-Air.local ~]
$ curl -X POST -d '{"attitude":"postive","user": "6J9erRNhtKsFew8TX"}' http://182.92.9.182/api/topics/ibjRtnCZ88PtfPXAQ/bets/ -H 'content-type: application/json'

{"status":"success","data":{"_id":"dYCoEBLJSsfuMoBjS","attitude":"postive","user":"6J9erRNhtKsFew8TX","topic":"ibjRtnCZ88PtfPXAQ","status":"open","open":46126,"ctime":1428757843942,"mtime":1428757843942}}

[yanlong@yandeMacBook-Air.local ~]
$ curl -X PUT -d '{}' http://182.92.9.182/api/topics/ibjRtnCZ88PtfPXAQ/bets/dYCoEBLJSsfuMoBjS -H 'content-type: application/json'

{"status":"success","data":{"_id":"dYCoEBLJSsfuMoBjS","attitude":"postive","user":"6J9erRNhtKsFew8TX","topic":"ibjRtnCZ88PtfPXAQ","status":"close","open":46126,"ctime":1428757843942,"mtime":1428757893388,"close":46136}}
```