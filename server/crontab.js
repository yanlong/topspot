SyncedCron.add({
  name: 'Crunch some important numbers for the marketing department',
  schedule: function(parser) {
    // parser is a later.parse object
    // return parser.text('every 5 seconds');
    return parser.text('every 1 minutes');
    // return parser.text('at 00:00 am');
},
job: function() {
    Models.rankings.insert({
        list: Rank.day(Date.now()),
        type: 'day',
        date: moment().format('YYYY-MM-DD'),
    })
    return ;
}
});

SyncedCron.start();