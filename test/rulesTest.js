var assert = require('assert');
var Rules = require('../lib/rules');

describe('rules', function() {
	describe('validate', function() {
		it('should return true for valid trigger rule', function() {
			assert.ok(Rules.validate({
				type: 'trigger',
				condition: 'condition string',
				alert: {
					type: 'email',
					address: 'test@example.com'
				}
			}));
		});

		it('should return true for valid periodic rule', function() {

		});

		it('should return true for valid deadline rule', function() {

		});

		it('should return false for invalid rule', function() {
			assert.fail(Rules.validate({
				
			}));
		});
	});

	describe('schedule', function() {
		it('should generate schedule for trigger rule', function() {

		});

		it('should generate schedule for periodic rule', function() {

		});

		it('should generate schedule for deadline rule', function() {

		});
	});
});