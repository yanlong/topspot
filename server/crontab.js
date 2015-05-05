SyncedCron.add({
  name: 'Crunch some important numbers for the marketing department',
  schedule: function(parser) {
    // parser is a later.parse object
    // return parser.text('every 5 seconds');
    return parser.text('every 10 minutes');
    // return parser.text('at 00:00 am');
},
job: function() {
    Models.rankings.insert({
        list: Rank.time(Date.now(), 5*60*1000),
        type: 'day',
        date: moment().format('YYYY-MM-DD'),
    })
    return ;
}
});

SyncedCron.start();