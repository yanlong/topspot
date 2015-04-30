Consts = {
    test: {
        num: 5,
    }
}

var catalogs = [{
	name: "娱乐",
	subs: [
	"中国好声音",
	"奔跑吧兄弟2",
	"我是歌手",
	"非诚勿扰",
	"音乐",
	"电影",
	"电视剧",
	"动漫",
	"明星"]
},
{
	name: "游戏",
	subs: [
	"英雄联盟",
	"Dota",
	"炉石传说",
	"网络游戏",
	"单机游戏",
	"手机游戏",
	"掌机游戏"]
},
{
	name: "体育",
	subs: [
	"NBA",
	"CBA",
	"世界杯",
	"欧冠",
	"亚冠",
	"羽毛球",
	"网球",
	"乒乓球",
	"其他"]
},
{
	name: "财经",
	subs: [
	"A股",
	"股票",
	"期货",
	"基金",
	"商业",
	"金融",
	"互联网"]
}]

Consts.catalogs = catalogs;

~function () {
	Consts.catalogs = _.map(Consts.catalogs, function (catalog) {
		catalog.subs = _.map(catalog.subs, function (sub) {
			return {
				name: sub
			}
		})
		return catalog;
	})
}();