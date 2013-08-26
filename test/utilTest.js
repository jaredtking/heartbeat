var assert = require('assert');
var Util = require('../lib/util');

describe('util', function() {
	describe('roundTimestamp', function() {
		// minutes
		it('should return 0 for minute', function() {
			assert.equal(0, Util.roundTimestamp(0, 'minute'));
			assert.equal(0, Util.roundTimestamp(57, 'minute'));
		});

		it('should return 60 for minute', function() {
			assert.equal(60, Util.roundTimestamp(60, 'minute'));
			assert.equal(60, Util.roundTimestamp(70, 'minute'));
		});

		// hours
		it('should return 0 for hour', function() {
			assert.equal(0, Util.roundTimestamp(0, 'hour'));
			assert.equal(0, Util.roundTimestamp(575, 'hour'));
		});

		it('should return 3600 for hour', function() {
			assert.equal(3600, Util.roundTimestamp(3600, 'hour'));
			assert.equal(3600, Util.roundTimestamp(3699, 'hour'));
		});

		// days
		it('should return 0 for day', function() {
			assert.equal(0, Util.roundTimestamp(0, 'day'));
			assert.equal(0, Util.roundTimestamp(86000, 'day'));
		});

		it('should return 86400 for day', function() {
			assert.equal(86400, Util.roundTimestamp(86400, 'day'));
			assert.equal(86400, Util.roundTimestamp(86999, 'day'));
		});
	});

	describe('timestamp', function() {
		it('should return correct unix timestamp for date', function() {
			assert.equal(1377147600, Util.timestamp(new Date.UTC(2013, 7, 22)));
		});

		it('should return rounded unix timestamp for date', function() {
			assert.equal(28034, Util.timestamp(new Date(28034808)));
		});
	});
});