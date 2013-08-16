var assert = require('assert'),
	scheduler = require('../lib/scheduler'),
	later = require('later');

describe('scheduler', function() {
	
	var rules = [
		{
			type: 'trigger',
			condition: 'anything.goes',
			alert: {
				type: 'email',
				endpoint: 'test@example.com'
			}
		},
		{
			type: 'schedule',
			condition: 'anything.goes',
			schedule: later.parse.text('every 2 s'),
			alert: {
				type: 'email',
				endpoint: 'test@example.com'
			}
		}
	];

	var schedule = scheduler.schedule(rules);

	describe('start', function() {

		it('should start and execute each rule once', function(done) {
			this.timeout(15000);

			var scheduleFired = false,
				triggerFired = false;

			schedule.start(function(rule) {

				//console.log('rule fired ' + JSON.stringify(rule));

				if (rule.type == 'schedule')
					scheduleFired = true;

				if (rule.type == 'trigger')
					triggerFired = true;

				if (scheduleFired && triggerFired) {
					schedule.stop();

					done();
				}
			});

			// fire triggers
			schedule.fireTriggers('anything.goes');
		});
	});

	describe('stop', function() {
		it('should stop the schedule', function(done) {

			this.timeout(10000);

			schedule.start(function() {
				throw new Error('Schedule called');
			});

			schedule.stop();

			assert.ok(!schedule.stats().running);

			// wait for 4s to be sure
			setTimeout(done, 4000);
		});
	});

	describe('stats', function() {
		it('should return number of rules', function() {
			var stats = schedule.stats();

			assert.equal(stats.rules, rules.length);
		});
	});

	describe('addRule', function() {
		if('should add 1 rule and skip 1 duplicate', function() {
			// add duplicate rule
			schedule.addRule({
				type: 'trigger',
				condition: 'anything.goes',
				alert: {
					type: 'email',
					endpoint: 'test@example.com'
				}
			})

			// add unique rule
			schedule.addRule({
				type: 'trigger',
				condition: 'new.rule',
				alert: {
					type: 'email',
					endpoint: 'test@example.com'
				}
			})

			// check stats
			var stats = schedule.stats();

			assert.equal(stats.rules, 3);
			assert.equal(stats.triggers, 2);
			assert.equal(stats.schedules, 2);
		});
	});

	describe('fireTriggers', function() {
		it('should fire the trigger callback', function(done) {
			// new schedule
			var schedule2 = scheduler.schedule([{
				type: 'trigger',
				condition: 'meh',
				alert: {
					type: 'email',
					endpoint: 'test@example.com'
				}
			}]);

			// test callback
			schedule2.start(function(rule) {
				if (rule.type == 'trigger')
					done();
			});

			// fire
			schedule2.fireTriggers('meh');

			// quite
			schedule2.stop();
		});
	});
});