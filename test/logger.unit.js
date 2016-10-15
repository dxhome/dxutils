'use strict';

var expect = require('chai').expect;
var Logger = require('../lib/logger');

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
      logger.on('data', function(data) {
        counter++;
        if (counter === 3) {
          done();
        }
      });
    });

  });


});