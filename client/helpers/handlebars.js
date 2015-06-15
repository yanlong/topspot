Template.registerHelper('pluralize', function(n, thing) {
  // fairly stupid pluralizer
  if (n === 1) {
    return '1 ' + thing;
  } else {
    return n + ' ' + thing + 's';
  }
});

Template.registerHelper('datetime2timestamp', function(datetime) {
	return moment(datetime).unix() * 1000;
})

Template.registerHelper('timestamp2datetime', function(timestamp) {
	return moment(timestamp).format('YYYY-MM-DDTHH:mm')
})

Template.registerHelper('userName', function(user) {
	return Meteor.users.findOne(user).username;
})
