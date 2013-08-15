var _ = require('underscore'),
	check = require('validator').check,
	sanitize = require('validator').sanitize;

var Rules = {

	types: [
		'trigger',
		'schedule'
	],

	operators: {
		'>': {
			args: 2
		},
		'>=': {
			args: 2
		},
		'<': {
			args: 2
		},
		'<=': {
			args: 2
		},
		'=': {
			args: 2
		},
		'not': {
			args: 1
		},
		'or': {
			args: 2
		},
		'and': {
			args: 2
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

		// todo validate with later

		return typeof schedule != 'undefined';
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