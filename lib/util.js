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

/**
 * Checks if an object is empty
 *
 * @param object o
 *
 * @return boolean true if empty
 */
exports.isEmptyObject = function(o) {
	for (var i in o) 
		if(o.hasOwnProperty(i))
			return false;

	return true;
};