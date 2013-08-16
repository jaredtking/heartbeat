var assert = require('assert'),
	_ = require('underscore'),
	Condition = require('../lib/condition'),
	Metrics = require('../lib/metrics');

describe('conditions', function() {
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
				var cond = new Condition(c);
				assert.ok(cond.isValid(), 'Valid condition(' + JSON.stringify(c) + ') failed validation');
			});
		});

		it('should return false for invalid condition', function() {
			var invalid = [
				'this should always fail',
				{},
				{ op: 'FAIL' },
				{
					op: '>',
					0: 'somemetric'
				}
			];

			_.each(invalid, function(c) {
				var cond = new Condition(c);
				assert.ok(!cond.isValid(), 'Invalid condition(' + JSON.stringify(c) + ') passed validation');
			});
		});
	});

	describe('metricNames', function() {

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

			var cond = new Condition(c);
			assert.deepEqual(cond.metricNames(), ['somemetric','anothermetric','lastmetric']);
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
				pass: [[1,1],['equality','equality']],
				fail: [[0,1],[1,0],['blah','meh']]
			},
			'<>': {
				pass: [[1,0],[0,1],['meh','blah']],
				fail: [[1,1],['meh','meh']]
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

		var evaluator = new Metrics.evaluator();

		_.each(testCases, function(value, op, list) {
			// pass cases
			_.each(value.pass, function(args, index, list2) {
				it('should return true for ' + op + ' operator with arguments ' + args, function() {
					// build the condition
					var c = { op: op };

					for (var i in args)
						c[i] = args[i];

					var cond = new Condition(c);
					assert.ok(cond.evaluate(evaluator));
				});
			});

			// fail cases
			_.each(value.fail, function(args, index, list2) {
				it('should return false for ' + op + ' operator with arguments ' + args, function() {
					// build the condition
					var c = { op: op };

					for (var i in args)
						c[i] = args[i];

					var cond = new Condition(c);
					assert.ok(!cond.evaluate(evaluator));
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

			var evaluator = new Metrics.evaluator();

			var cond = new Condition(c);
			it('should return true for nested condition', function() {
				assert.ok(cond.evaluate(evaluator));
			});
		});
	});
});	