if (Meteor.isClient) {
    Template.addTopic.events({
        'click submit':function (e) {
            e.preventDefault();

            var post = {
              url: $(e.target).find('[name=url]').val(),
              title: $(e.target).find('[name=title]').val()
          };
      }
  })
}