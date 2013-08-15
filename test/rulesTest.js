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
			assert.ok(Rules.validate({
				type: 'periodic',
				condition: 'condition string',
				alert: {
					type: 'email',
					address: 'test@example.com'
				}
			}));
		});

		it('should return true for valid deadline rule', function() {
			assert.ok(Rules.validate({
				type: 'deadline',
				condition: 'condition string',
				alert: {
					type: 'email',
					address: 'test@example.com'
				}
			}));
		});

		it('should return false for invalid rule', function() {
			assert.ok(!Rules.validate({}));
			assert.ok(!Rules.validate('is this thing on?'));
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