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

	if (mod == 1) return timestamp;

	return Math.floor( timestamp / mod ) * mod;
};