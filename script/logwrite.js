'use strict';

var Logger = require('..').Logger;

var logger = Logger(Logger.LOG_LEVEL_INFO, {
  files: ['./write.log']
});

for (let i=0; i<10; i++) {
  logger.info('Logging %d info', i);
  logger.warn('Logging %d warning', i);
  logger.error('Logging %d error', i);
}

