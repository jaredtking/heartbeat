var assert = require('assert'),
	_ = require('underscore'),
	condition = require('../lib/condition'),
	metrics = require('../lib/metrics');

describe('conditions', function() {

	// metrics storage provider
	var storage = metrics.storage();

	describe('isValid', function() {
		it('should return true for valid condition', function() {
			var valid = [
				{
					op: '>',
					0: 'somemetric',
					1: 'number',
					2: 'blah',
					3: 'blah',
					4: 'blahhh'
				},
				{
					op: '<',
					0: 'somemetric',
					1: 'number'
				},
				{
					op: '=',
					0: 'somemetric',
					1: 'number'
				},
				{
					op: 'and',
					0: {
						op: '>',
						0: 'somemetric',
						1: 123
					},
					1: {
						op: 'or',
						0: {
							op: '<',
							0: 'anothermetric',
							1: 1234
						},
						1: {
							op: '>',
							0: 'anothermetric',
							1: 12345
						}
					}
				},
				'this.is.a.valid.metric'
			];

			_.each(valid, function(c) {
				assert.ok(condition(c).isValid(), 'Valid condition(' + JSON.stringify(c) + ') failed validation');
			});
		});

		it('should return false for invalid condition', function() {
			var invalid = [
				{},
				{ op: 'FAIL' },
				{
					op: '>',
					0: 'somemetric'
				}
			];

			_.each(invalid, function(c) {
				assert.ok(!condition(c).isValid(), 'Invalid condition(' + JSON.stringify(c) + ') passed validation');
			});
		});
	});

	describe('metricNames', function() {

		it('should evaluate to a single metric name', function() {
			assert.deepEqual(condition('test.metric').metricNames(), ['test.metric']);
		});

		it('should evaluate to metric names', function() {
			var c = {
				op: 'and',
				0: {
					op: '>',
					0: 'somemetric',
					1: 123
				},
				1: {
					op: 'or',
					0: {
						op: '<',
						0: 'anothermetric',
						1: 1234
					},
					1: {
						op: '>',
						0: 'lastmetric',
						1: 12345
					}
				}
			};

			assert.deepEqual(condition(c).metricNames(), ['somemetric','anothermetric','lastmetric']);
		});
	});

	describe('evaluate', function() {
		var testCases = {
			'>': {
				pass: [[1,0]],
				fail: [[0,1],[1,1]]
			},
			'>=': {
				pass: [[1,0],[1,1]],
				fail: [[0,1]]
			},
			'<': {
				pass: [[0,1]],
				fail: [[1,0],[1,1]]
			},
			'<=': {
				pass: [[0,1],[1,1]],
				fail: [[1,0]]
			},
			'=': {
				pass: [[1,1],['#equality','#equality']],
				fail: [[0,1],[1,0],['#blah','#meh']]
			},
			'<>': {
				pass: [[1,0],[0,1],['#meh','#blah']],
				fail: [[1,1],['#meh','#meh']]
			},
			'not': {
				pass: [[false]],
				fail: [[true]]
			},
			'or': {
				pass: [[true,false,false],[false,true],[false,false,false,false,false,true]],
				fail: [[false,false],[false,false,false,false,false]]
			},
			'and': {
				pass: [[true,true],[true,true,true,true]],
				fail: [[false,false],[false,true,false,false,true]]
			}
		};

		_.each(testCases, function(value, op, list) {
			// pass cases
			_.each(value.pass, function(args, index, list2) {
				it('should return true for ' + op + ' operator with arguments ' + args, function() {
					// build the condition
					var c = { op: op };

					for (var i in args)
						c[i] = args[i];

					assert.ok(condition(c).evaluate(storage));
				});
			});

			// fail cases
			_.each(value.fail, function(args, index, list2) {
				it('should return false for ' + op + ' operator with arguments ' + args, function() {
					// build the condition
					var c = { op: op };

					for (var i in args)
						c[i] = args[i];

					assert.ok(!condition(c).evaluate(storage));
				});
			});
		});

		describe('nested', function() {
			var c = {
				op: 'and',
				0: {
					op: '>',
					0: 4,
					1: 2
				},
				1: {
					op: 'or',
					0: {
						op: '<',
						0: 4,
						1: 2
					},
					1: {
						op: '>',
						0: 4,
						1: 1
					}
				}
			};

			it('should return true for nested condition', function() {
				assert.ok(condition(c).evaluate(storage));
			});
		});
	});
});	