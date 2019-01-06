
const log = require('log4js');
log.configure({
  appenders: { cheese: { type: 'file', filename: './one_bookmark.log' } },
  categories: { default: { appenders: ['cheese'], level: 'debug' } }
});

const logger = log.getLogger('cheese');

module.exports = logger;