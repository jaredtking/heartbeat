var assert = require('assert'),
	_ = require('underscore'),
	later = require('later'),
	Rules = require('../lib/rules');

describe('rules', function() {
	describe('validateRuleType', function() {
		it('should return true for valid rule types', function() {
			var valid = [
				'trigger',
				'schedule'
			];

			_.each(valid, function(type) {
				assert.ok(Rules.validateRuleType(type), 'Valid rule type(' + type + ') failed validation');
			});	
		});

		it('should return false for invalid rule types', function() {
			var invalid = [
				{},
				'',
				'fail'
			];

			_.each(invalid, function(type) {
				assert.ok(!Rules.validateRuleType(type), 'Invalid rule type(' + type + ') passed validation');
			});
		});		
	});

	describe('validateSchedule', function() {
		it('should return true for valid schedules', function() {
			var valid = [
				later.parse.text('every 5 minutes'),
				{h: [10], m: [15,45]}
			];

			_.each(valid, function(schedule) {
				assert.ok(Rules.validateSchedule(schedule), 'Valid schedule(' + JSON.stringify(schedule) + ') failed validation');
			});
		});

		it('should return false for invalid schedules', function() {
			var invalid = [
				'fail',
				'',
				{},
				[],
				undefined
			];

			_.each(invalid, function(schedule) {
				assert.ok(!Rules.validateSchedule(schedule), 'Invalid schedule(' + JSON.stringify(schedule) + ') passed validation');
			});
		});
	});

	describe('validateAlert', function() {
		it('should return true for valid alerts', function() {
			var valid = [
				{
					type: 'email',
					endpoint: 'johnny@appleseed.com'
				},
				[
					{
						type: 'email',
						endpoint: 'johnny@appleseed.com'
					},
					{
						type: 'sms',
						endpoint: '1234567890'
					}
				]
			];

			_.each(valid, function(alert) {
				assert.ok(Rules.validateAlert(alert), 'Valid alert(' + JSON.stringify(alert) + ') failed validation');
			});
		});

		it('should return false for invalid alerts', function() {
			var invalid = [
				{
					type: 'email',
					endpoint: 'fail'
				},
				{
					type: 'sms',
					endpoint: 'fail'
				}
			];

			_.each(invalid, function(alert) {
				assert.ok(!Rules.validateAlert(alert), 'Invalid alert(' + JSON.stringify(alert) + ') passed validation');
			});
		});
	});

	describe('validate', function() {
		it('should return true for valid trigger rule', function() {
			assert.ok(Rules.validate({
				type: 'trigger',
				condition: 'valid.condition.string',
				alert: {
					type: 'email',
					endpoint: 'johnny@appleseed.com'
				}
			}));
		});

		it('should return true for valid schedule rule', function() {
			assert.ok(Rules.validate({
				type: 'schedule',
				condition: {
					op: '>',
					0: 'servers.dallas.cpu',
					1: 90
				},
				alert: {
					type: 'email',
					endpoint: 'johnny@appleseed.com'
				},
				schedule: later.parse.text('every 5 min')
			}));
		});

		it('should return false for invalid rule', function() {
			// try some invalid rules
			var invalid = [
				{},
				'is this thing on?',
				{
					type: 'explode'
				},
				{
					type: 'trigger',
					condition: {}
				},
				{
					type: 'schedule',
					condition: {
						op: '>',
						0: 'ok',
						1: 'ok'
					},
					alert: {
						type: 'email',
						endpoint: 'johnny@appleseed.com'
					}
				},
				{
					type: 'trigger',
					condition: {
						op: '>',
						0: 'ok',
						1: 'ok'
					},
					alert: {
						type: 'sms',
						endpoint: 'fail'
					}
				},
				[]
			];

			_.each(invalid, function(rule) {
				assert.ok(!Rules.validate(rule), 'Invalid rule(' + JSON.stringify(rule) + ') passed validation');
			});
		});
	});
});