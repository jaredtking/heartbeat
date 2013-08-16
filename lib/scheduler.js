var _ = require('underscore'),
	Rules = require('./rules'),
	condition = require('./condition'),
	crypto = require('crypto'),
	later = require('later');

// TODO need to include original rule in callback

module.exports = {

	schedule: function(rules) {

		var triggerRules = {},
			triggers = {},
			scheduleRules = {},
			running = false;

		function add(rule) {
			// validate the rule
			if (!Rules.validate(rule))
				return false;

			// unique key for rule
			var key = crypto.createHash('md5').update(JSON.stringify(rule)).digest('hex');

			if (rule.type == 'trigger') {
				// check if the rule has been added before
				if (typeof triggerRules[key] != 'undefined')
					return false;

				// add the rule to the schedule
				triggerRules[key] = {
					rule: rule,
					on: false
				};

			} else if (rule.type == 'schedule') {
				// check if the rule has been added before
				if (typeof scheduleRules[key] != 'undefined')
					return false;

				// add the rule to the schedule
				scheduleRules[key] = {
					rule: rule,
					on: false,
					timer: null
				};

				return true;
			}
		}

		_.each(rules, function(rule) {
			return add(rule);
		});

		return {

			addRule: function(rule) {
				return add(rule);
			},

			start: function(cb) {
				// setup triggers
				_.each(triggerRules, function(rule) {
					if (!rule.on) {
						rule.on = true;

						// create a trigger for each metric
						_.each(condition(rule.condition).metricNames(), function(metric) {
							if (typeof triggers[metric] == 'undefined')
								triggers[metric] = [];

							triggers[metric].push(cb);
						});
					}
				});

				// start schedule rules
				_.each(scheduleRules, function(rule) {
					if (!rule.on) {
						rule.timer = later.setInterval(cb, rule.rule.schedule);
						rule.on = true;
					}
				});

				running = true;
			},

			stop: function() {
				// remove triggers
				triggers = {};
				_.each(triggerRules, function(rule) {
					rule.on = false;
				});

				// stop schedule rules
				_.each(scheduleRules, function(rule) {
					if (rule.on) {
						rule.timer.clear();
						rule.on = false;
					}
				});

				running = false;
			},

			stats: function() {
				return {
					rules: _.size(triggerRules) + _.size(scheduleRules),
					running: running
				};
			},

			/** 
			 * Fires the triggers for supplied metric(s)
			 *
			 * @param string|Array metric
			 */
			fireTriggers: function(metric) {
				if (metric instanceof Array)
					_.each(metric, function(m) {
						fireTriggers(m);
					});

				_.each(triggers[metric], function(cb) {
					cb();
				});
			}
		};
	}

};