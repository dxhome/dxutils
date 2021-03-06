'use strict';

var fs = require('fs');
var merge = require('merge');
var colors = require('colors/safe');
var printf = require('util').format;
var inherits = require('util').inherits;
var ReadableStream = require('readable-stream');

/**
 * New a logger
 * @param {Number} allowlevel - {@link Loglevel} allowed log level
 * @param {Object} options - log options
 * @param {String} options.prefix - logging prefix
 * @param {Array} options.stream - logging streams, ie. stdout, filename, ...
 * @param {Number} options.callback - number of callback traces shown
 * @param {Boolean} options.isJSON - logging in json format
 * @returns {Logger}
 * @constructor
 * @extends {ReadableStream}
 */
function Logger(allowlevel, options) {
  var self = this;

  if (!(this instanceof Logger)){
    return new Logger(allowlevel, options);
  }

  this._allowlevel = (typeof allowlevel !== 'undefined') ?
    allowlevel : Logger.LOG_LEVEL_INFO;
  this._options = merge(Logger.DEFAULTS, options);

  ReadableStream.call(this);

  this._options.files.forEach(function (output) {
    if (typeof output === 'string') {
      // create object with file destination
      let s = fs.createWriteStream(output, {flags: 'a+'});
      self.pipe(s);
    }
  });

  if (this._options.isStdout) {
    this.pipe(process.stdout);
  }

}

inherits(Logger, ReadableStream);

/**
 * Default logger configurations
 */
Logger.DEFAULTS = {
  prefix: 'dxlog',
  files: [],
  callback: 3,
  isStdout: true,
  isJSON: false
};

/**
 * Loglevel
 */
Logger.LOG_LEVEL_NONE = 0;
Logger.LOG_LEVEL_ERROR = 1;
Logger.LOG_LEVEL_WARN = 2;
Logger.LOG_LEVEL_INFO = 3;
Logger.LOG_LEVEL_DEBUG = 4;

Logger.LOGLEVELSTR = [
  'NONE',
  'ERROR',
  'WARN',
  'INFO',
  'DEBUG'
]
;
Logger.LOGLEVELCOLOR = [
  colors.white,
  colors.red,
  colors.yellow,
  colors.blue,
  colors.magenta
];

/**
 * Do for ReadableStream#_read
 * @private
 */
Logger.prototype._read = function () {
  this.resume();
};

/**
 * Push log message to queue
 * @param {Number} loglv - log level
 * @param {String} formatter - printf-like format messages
 * @private
 */
Logger.prototype._rawlog = function (loglv, formatter) {
  if (loglv > this._allowlevel) {
    return;
  }

  var inputs = Array.prototype.slice.call(arguments, 2);
  var log = {
    time: new Date().toLocaleString(),
    level: Logger.LOGLEVELSTR[loglv],
    prefix: this._options.prefix,
    message: printf.apply(printf, [formatter].concat(inputs))
  };

  var output = '';
  if (this._options.isJSON) {
    output = JSON.stringify(log);
  } else {
    let colorfulLv = Logger.LOGLEVELCOLOR[loglv]('{'+log.level+'}');
    output = [log.time, log.prefix, colorfulLv, log.message].join(' ');
  }

  this.push(output + '\n');
  this.emit('log', log);
};

/**
 * Info logging
 */
Logger.prototype.info = function () {
  this._rawlog.apply(this, [Logger.LOG_LEVEL_INFO].concat(
    Array.prototype.slice.call(arguments))
  );
};

/**
 * Warning logging
 */
Logger.prototype.warn = function () {
  this._rawlog.apply(this, [Logger.LOG_LEVEL_WARN].concat(
    Array.prototype.slice.call(arguments))
  );
};

/**
 * Error logging
 */
Logger.prototype.error = function () {
  this._rawlog.apply(this, [Logger.LOG_LEVEL_ERROR].concat(
    Array.prototype.slice.call(arguments))
  );
};

/**
 * Debug logging
 */
Logger.prototype.debug = function () {
  this._rawlog.apply(this, [Logger.LOG_LEVEL_DEBUG].concat(
    Array.prototype.slice.call(arguments))
  );
};

/**
 * Logger
 * @type {Logger}
 */
module.exports = Logger;