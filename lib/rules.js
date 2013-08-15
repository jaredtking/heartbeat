var _ = require('underscore'),
	check = require('validator').check,
	sanitize = require('validator').sanitize;

function validateRuleType(type) {
	return _.contains(['trigger','periodic','deadline'], type);
}

function validateCondition(condition) {
	
	if (typeof condition != 'string')
		return false;

	try {
		// TODO should attempt to actually parse condition
		check(condition).len(1);
	} catch (e) {
		return false;
	}

	return true;
}

function validateAlert(alert) {
	// validate alert type
	if (typeof alert.type == 'undefined' || !_.contains(['email','sms'], alert.type))

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
}

/**
 * Validates a rule
 *
 * @param object rule
 *
 * @return boolean
 */
exports.validate = function(rule) {

	if (typeof rule != 'object')
		return false;

	// check for a valid type
	if (typeof rule.type == 'undefined' || !validateRuleType(rule.type))
		return false;

	// check for a valid condition
	if (!validateCondition(rule.condition))
		return false;

	// check for a valid alert
	if (typeof rule.alert != 'object')
		return false;

	if( rule.alert instanceof Array ) {
		for (var i in rule.alert) {
			if (!validateAlert(rule.alert[i]))
				return false;
		}
	} else {
		if (!validateAlert(rule.alert))
			return false;
	}

	return true;
};

/**
 * Generates a schedule for a given rule
 *
 * @param object rule
 *
 * @return object schedule
 */
exports.schedule = function(rule) {

};