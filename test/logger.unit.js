'use strict';

var fs = require('fs');
var expect = require('chai').expect;
var Logger = require('../lib/logger');

function prepare(files) {
  var testdir = './testdata';

  if (!(fs.existsSync(testdir))) {
    fs.mkdirSync(testdir);
  }

  files.forEach(function (file) {
    if (fs.existsSync(file)) {
      fs.truncateSync(file, 0);
    }
  });
}

describe('Logger', function() {

  describe('@constructor', function() {
    it ('should create an instance with default options', function () {
      var logger = Logger();
      expect(logger).to.be.instanceOf(Logger);
      expect(logger._allowlevel).to.equal(Logger.LOG_LEVEL_INFO);
      expect(logger._options).to.equal(Logger.DEFAULTS);
    });

    it('should queue logs until stream is consumed', function(done) {
      var counter = 0;
      var logger = new Logger();
      logger.info('test');
      logger.info('test');
      logger.info('test');
      logger.on('data', function() {
        counter++;
        if (counter === 3) {
          done();
        }
      });
    });

    it('should log in JSON format', function(done) {
      var logger = new Logger(Logger.LOG_LEVEL_INFO, {isJSON: true});

      logger.once('data', function (data) {
        expect(JSON.parse(data).message).to.equal('test');
        expect(JSON.parse(data).level).to.equal('INFO');

        done();
      });

      logger.info('test');
    });

    it('should log in plain txt format', function(done) {
      var logger = new Logger(Logger.LOG_LEVEL_INFO, {isJSON: false});

      logger.once('data', function (data) {
        expect(data.toString()).to.contain('{INFO} test');

        done();
      });

      logger.info('test');
    });

    it('should log with customized prefix', function(done) {
      var logger = new Logger(Logger.LOG_LEVEL_INFO, {isJSON: true, prefix: 'myprefix'});

      logger.once('data', function (data) {
        expect(JSON.parse(data).prefix).to.equal('myprefix');

        done();
      });

      logger.info('test');
    });

    it('should log into file as well', function(done) {
      var logfiles = ['./testdata/test.log'];

      prepare(logfiles);

      // perform testing
      var logger = new Logger(Logger.LOG_LEVEL_INFO, {isJSON: true, files: logfiles});

      logger.once('data', function (data) {
        // delay 1s to wait for file write sync
        setTimeout(function () {
          logfiles.forEach(function (file) {
            expect(data[20]).to.equal(fs.readFileSync(file)[20]);
          });

          done();
        }, 1000);
      });

      logger.info('test');
    });

  });

  describe('#debug', function() {
    it('should log when log level is allowed', function(done) {
      var logger = new Logger(Logger.LOG_LEVEL_DEBUG, {isJSON: true});

      logger.once('data', function (data) {
        expect(JSON.parse(data).level).to.equal('DEBUG');
        done();
      });

      logger.debug('my data');
    });

    it('should not log when log level is not allowed', function(done) {
      var logger = new Logger(Logger.LOG_LEVEL_INFO, {isJSON: true});

      logger.once('data', function () {
        done(new Error('Incorrectly logging outside of defined level'));
      });

      logger.debug('my data');
      setImmediate(done);
    });

  });

  describe('#info', function() {
    it('should log when log level is allowed', function(done) {
      var logger = new Logger(Logger.LOG_LEVEL_INFO, {isJSON: true});

      logger.once('data', function (data) {
        expect(JSON.parse(data).level).to.equal('INFO');
        done();
      });

      logger.info('my data');
    });

    it('should not log when log level is not allowed', function(done) {
      var logger = new Logger(Logger.LOG_LEVEL_WARN, {isJSON: true});

      logger.once('data', function () {
        done(new Error('Incorrectly logging outside of defined level'));
      });

      logger.info('my data');
      setImmediate(done);
    });

  });

  describe('#warn', function() {
    it('should log when log level is allowed', function(done) {
      var logger = new Logger(Logger.LOG_LEVEL_WARN, {isJSON: true});

      logger.once('data', function (data) {
        expect(JSON.parse(data).level).to.equal('WARN');
        done();
      });

      logger.warn('my data');
    });

    it('should not log when log level is not allowed', function(done) {
      var logger = new Logger(Logger.LOG_LEVEL_ERROR, {isJSON: true});

      logger.once('data', function () {
        done(new Error('Incorrectly logging outside of defined level'));
      });

      logger.warn('my data');
      setImmediate(done);
    });

  });

  describe('#error', function() {
    it('should log when log level is allowed', function(done) {
      var logger = new Logger(Logger.LOG_LEVEL_ERROR, {isJSON: true});

      logger.once('data', function (data) {
        expect(JSON.parse(data).level).to.equal('ERROR');
        done();
      });

      logger.error('my data');
    });

    it('should not log when log level is not allowed', function(done) {
      var logger = new Logger(Logger.LOG_LEVEL_NONE, {isJSON: true});

      logger.once('data', function () {
        done(new Error('Incorrectly logging outside of defined level'));
      });

      logger.error('my data');
      setImmediate(done);
    });

  });
});