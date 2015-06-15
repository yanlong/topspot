var isMaster = process.env.TP_MASTER == 1;
if (!isMaster) return;
logger.info('Server is running as [master]');

SyncedCron.start();
Calc.init();

Roles.addUsersToRoles(Meteor.users.findOne({username:'topspot'}), ['admin', 'editor']);
