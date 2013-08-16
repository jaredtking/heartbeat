var _ = require('underscore'),
	Rules = require('./rules'),
	condition = require('./condition'),
	crypto = require('crypto'),
	later = require('later');

module.exports = {

	schedule: function(rules) {

		var triggerRules = {},
			triggers = {},
			scheduleRules = {},
			running = false;

		function ruleKey(rule) {
			return crypto.createHash('md5').update(JSON.stringify(rule)).digest('hex')
		}

		function add(rule) {
			// validate the rule
			if (!Rules.validate(rule))
				return false;

			// unique key for rule
			var key = ruleKey(rule);

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
				_.each(triggerRules, function(value, key) {
					if (!value.on) {
						value.on = true;

						// create a trigger for each metric
						_.each(condition(value.rule.condition).metricNames(), function(metric) {
							if (typeof triggers[metric] == 'undefined')
								triggers[metric] = [];

							triggers[metric].push({cb:cb, key:key});
						});
					}
				});

				// start schedule rules
				_.each(scheduleRules, function(value) {
					if (!value.on) {
						value.timer = later.setInterval(function() { cb(value.rule); }, value.rule.schedule);
						value.on = true;
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
				var stats = {
					triggers: _.size(triggerRules),
					schedules: _.size(scheduleRules),
					running: running
				};
				stats.rules = stats.triggers + stats.schedules;

				return stats;
			},

			/** 
			 * Fires the triggers for supplied metric(s)
			 *
			 * @param string|Array metric
			 */
			fireTriggers: function(metric) {
				if (!running)
					return;

				if (metric instanceof Array)
					_.each(metric, function(m) {
						fireTriggers(m);
					});

				_.each(triggers[metric], function(trigger) {
					trigger.cb(triggerRules[trigger.key].rule);
				});
			}
		};
	}

};