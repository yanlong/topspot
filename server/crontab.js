SyncedCron.add({
    name: 'Calc day rankings',
    schedule: function(parser) {
        // parser is a later.parse object
        // return parser.text('every 5 seconds');
        return parser.text('every 1 minutes');
        // return parser.text('at 00:00 am');
    },
    job: function() {
        Consts.catalogList.forEach(function(catalog) {
            Models.rankings.insert({
                list: Rank.day(Date.now(), catalog == 'All'? null:catalog),
                type: 'day',
                catalog: catalog,
                date: moment().format('YYYY-MM-DD'),
            })
        })
        return;
    }
});

SyncedCron.start();