var _ = require('underscore'),
	check = require('validator').check,
	sanitize = require('validator').sanitize,
	later = require('later'),
	util = require('./util'),
	condition = require('./condition');

var Rules = {

	types: [
		'trigger',
		'schedule'
	],

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
	 * Validates an rule scedule
	 *
	 * @param object schedule
	 *
	 * @return boolean
	 */
	validateSchedule: function(schedule) {

		if (typeof schedule != 'object' || typeof schedule.schedules == 'undefined') {
			if (_.isEmpty(schedule) || (schedule instanceof Array && schedule.length == 0) || typeof schedule == 'string')
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

		if (!condition(rule.condition).isValid())
			return false;

		// validate schedule rules
		if (rule.type == 'schedule' && !Rules.validateSchedule(rule.schedule))
			return false;

		if (!Rules.validateAlert(rule.alert))
			return false;

		return true;
	},

};

module.exports = Rules;