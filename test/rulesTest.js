var assert = require('assert');
var _ = require('underscore');
var Rules = require('../lib/rules');

describe('rules', function() {
	describe('validate', function() {
		it('should return true for valid trigger rule', function() {
			assert.ok(Rules.validate({
				type: 'trigger',
				condition: 'condition string',
				alert: {
					type: 'email',
					endpoint: 'test@example.com'
				}
			}));
		});

		it('should return true for valid periodic rule', function() {
			assert.ok(Rules.validate({
				type: 'periodic',
				condition: 'condition string',
				alert: {
					type: 'email',
					endpoint: 'test@example.com'
				}
			}));
		});

		it('should return true for valid deadline rule', function() {
			assert.ok(Rules.validate({
				type: 'deadline',
				condition: 'condition string',
				alert: {
					type: 'email',
					endpoint: 'test@example.com'
				}
			}));
		});

		it('should return true for valid periodic rule with multiple alerts', function() {
			assert.ok(Rules.validate({
				type: 'deadline',
				condition: 'condition string',
				alert: [
					{
						type: 'email',
						endpoint: 'test@example.com'
					},
					{
						type: 'sms',
						endpoint: '1234567890'
					}
				]
			}));
		});		

		it('should return false for invalid rule', function() {
			// try some invalid rules
			var invalid = [
				{},
				'is this thing on?',
				{
					type: 'explode',
					condition: 'random condition string',
					alert: {
						type: 'email',
						endpoint: 'test@example.com'
					}
				},
				{
					type: 'trigger',
					condition: {},
					alert: {
						type: 'email',
						endpoint: 'test@example.com'
					}
				},
				{
					type: 'trigger',
					condition: 'random condition string',
					alert: {
						type: 'email',
						endpoint: 'fail'
					}
				},
				{
					type: 'trigger',
					condition: 'random condition string',
					alert: {
						type: 'sms',
						endpoint: 'fail'
					}
				}
			];

			_.each(invalid, function(rule) {
				assert.ok(!Rules.validate(rule), 'Invalid rule(' + JSON.stringify(rule) + ') passed validation');
			});
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