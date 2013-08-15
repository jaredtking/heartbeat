var _ = require('underscore'),
	check = require('validator').check,
	sanitize = require('validator').sanitize,
	later = require('later'),
	util = require('./util');

var Rules = {

	types: [
		'trigger',
		'schedule'
	],

	operators: {
		'>': {
			args: 2,
			func: function(e, a, b) {
				return e.get(a) > e.get(b);
			}
		},
		'>=': {
			args: 2,
			func: function(e, a, b) {
				return e.get(a) >= e.get(b);
			}
		},
		'<': {
			args: 2,
			func: function(e, a, b) {
				return e.get(a) < e.get(b);
			}
		},
		'<=': {
			args: 2,
			func: function(e, a, b) {
				return e.get(a) >= e.get(b);
			}
		},
		'=': {
			args: 2,
			func: function(e, a, b) {
				return e.get(a) == e.get(b);
			}
		},
		'not': {
			args: 1,
			func: function(e, a) {
				return !e.get(a);
			}
		},
		'or': {
			args: 2,
			func: function(e) {
				var args = Array.prototype.slice.call(arguments);

				// evaluate each argument
				for (var i in args) {
					if (i > 0)
						args[i] = e.get(args[i]);
				}

				return _.reduce(args, function(a,b) { return a || b; }, false);
			}
		},
		'and': {
			args: 2,
			func: function(e) {
				var args = Array.prototype.slice.call(arguments);

				// evaluate each argument
				for (var i in args) {
					if (i > 0)
						args[i] = e.get(args[i]);
				}

				return _.reduce(args, function(a,b) { return a && b; }, true);
			}
		}
	},

	alertTypes: {
		'email': {
			// later
		},
		'sms': {
			// later	
		}
	},

	/** 
	 * Validates a rule type
	 *
	 * @param string type
	 *
	 * @return boolean
	 */
	validateRuleType: function(type) {

		return typeof type == 'string' && _.contains(Rules.types, type);
	},

	/** 
	 * Validates a condition
	 *
	 * @param object|string condition
	 *
	 * @return boolean
	 */
	validateCondition: function(condition) {
		
		if (typeof condition != 'object') {
			try {
				check(condition).len(1).notContains(' ');
			} catch (e) {
				return false;
			}

			return true;
		}

		// look for a valid operator
		var operator = Rules.operators[condition.op];
		if (typeof operator != 'object')
			return false;

		// look up the number of arguments in 
		var numArgs = -1;
		while (typeof condition[++numArgs] != 'undefined') ;

		// check for correct number of arguments
		if (numArgs < operator.args)
			return false;

		// recursively validate each argument
		for (var i = 0; i < operator.args; i++) {
			if (!Rules.validateCondition(condition[i]))
				return false;
		}

		return true;
	},

	/** 
	 * Validates an rule scedule
	 *
	 * @param object schedule
	 *
	 * @return boolean
	 */
	validateSchedule: function(schedule) {

		if (typeof schedule != 'object' || typeof schedule.schedules == 'undefined') {
			if (util.isEmptyObject(schedule) || (schedule instanceof Array && schedule.length == 0) || typeof schedule == 'string')
				return false;

			schedule = {schedules: schedule};
		}

		// attempt to compile schedule in later.js
		try {
			later.schedule(schedule);
		} catch (e) {
			return false;
		}

		return true;
	},

	/** 
	 * Validates an alert
	 *
	 * @param object|Array alert
	 *
	 * @return boolean
	 */
	validateAlert: function(alert) {
		// validate alert type
		if (typeof alert != 'object')
			return false;

		if( alert instanceof Array ) {
			for (var i in alert) {
				if (!Rules.validateAlert(alert[i]))
					return false;
			}

			return true;
		} 

		var alertTemplate = Rules.alertTypes[alert.type];

		if (typeof alertTemplate == 'undefined')
			return false;

		// validate the endpoint (e-mail address, phone number)
		if (typeof alert.endpoint == 'undefined')
			return false;

		if (alert.type == 'email') {

			// validate e-mail address
			try {
				check(alert.endpoint).isEmail();
			} catch (e) {
				return false;
			}

		} else if (alert.type == 'sms') {

			try {
				check(sanitize(alert.endpoint).toInt()).len(3);
			} catch (e) {
				return false;
			}
		}

		return true;
	},

	/**
	 * Validates a rule
	 *
	 * @param object rule
	 *
	 * @return boolean
	 */
	validate: function(rule) {

		if (typeof rule != 'object')
			return false;

		if (!Rules.validateRuleType(rule.type))
			return false;

		if (!Rules.validateCondition(rule.condition))
			return false;

		// validate schedule rules
		if (rule.type == 'schedule' && !Rules.validateSchedule(rule.schedule))
			return false;

		if (!Rules.validateAlert(rule.alert))
			return false;

		return true;
	},

	/** 
	 * Recursively retrieves the names of all the metrics in a condition
	 *
	 * @param object|string condition
	 *
	 * @return Array
	 */
	conditionMetricNames: function(condition) {

		if (typeof condition == 'string')
			return [condition];

		var names = [];

		var numArgs = -1;
		while (typeof condition[++numArgs] != 'undefined')
			names.concat(Rules.conditionMetricNames(condition[numArgs]));

		return names;
	},

	/** 
	 * Recursively evaluates a condition, assumes a valid condition has been supplied
	 *
	 * @param object|string condition
	 * @param Metrics.evaluator
	 *
	 * @return boolean
	 */
	evaluateCondition: function(condition, evaluator) {

		if (typeof condition != 'object')
			return condition;
		
		// collect and recursively evaluate each argument
		var numArgs = -1;
		var args = [evaluator];
		while (typeof condition[++numArgs] != 'undefined')
			args.push(Rules.evaluateCondition(condition[numArgs]));

		// call the operator function
		return Rules.operators[condition.op].func.apply({}, args);
	},

	/**
	 * Generates a schedule for a given rule
	 *
	 * @param object rule
	 *
	 * @return object schedule
	 */
	schedule: function(rule) {

	}
};

module.exports = Rules;