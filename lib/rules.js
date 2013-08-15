var _ = require('underscore');

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
	if (typeof rule.type == 'undefined' || !_.contains(['trigger','periodic','deadline'], rule.type))
		return false;

	// check for a valid condition

	// check for a valid alert
	if (typeof rule.alert == 'undefined')
		return false;

	if( rule.alert instanceof Array ) {

	} else {

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