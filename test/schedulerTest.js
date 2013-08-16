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
		// todo
	});

	describe('fireTriggers', function() {
		// todo
	});
});