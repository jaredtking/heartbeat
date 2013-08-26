var moment = require('moment');

/** 
 * Converts a date to a unix timestamp
 *
 * @param Date
 *
 * @return int timestamp
 */
exports.timestamp = function (date) {
	return moment(date).unix();
};

/**
 * Rounds a timestamp to 
 *
 * @param int timestamp unix timestamp
 * @param string granularity second, minute, hour, day
 *
 * @return int rounded timestamp
 */
exports.roundTimestamp = function (timestamp, granularity) {

	modMap = {
		'minute': 60,
		'hour': 3600,
		'day': 86400
	};

	mod = (typeof modMap[granularity] != 'undefined') ? modMap[granularity] : 1;

	return Math.max(Math.floor( timestamp / mod ) * mod, 0);
};