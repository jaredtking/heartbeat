var check = require('validator').check,
	Util = require('./util'),
	_ = require('underscore'),
	MockProvider = require('./providers/mock');

/**
 * Checks if a value is a metric name
 *
 * @param string|number test
 *
 * @return boolean
 */
isMetric = function (test) {
	if (typeof test != 'string')
		return false;

	try {
		check(test).len(1).is(/^[a-zA-Z][a-zA-Z0-9.]+$/);
	} catch (e) {
		return false;
	}

	return true;
};

exports.storage = function(provider) {

	// default to mock storage provider
	if (typeof provider != 'object' || provider == null)
		provider = new MockProvider();

	var granularities = ['second','minute','hour','day'];

	var grainIntervals = {
		second: 1,
		minute: 60,
		hour: 3600,
		day: 86400
	}

	return {

		/*
			NOTES
			What methods should the storage provider offer?

			get(key)
			set(key, value)
			addTo(key, value)
		*/
		
		/** 
		 * Fetches a metric's value(s) or returns the input if it is
		 * not a valid metric name.
		 * If a start and end date are specified then values
		 * within the time period will be fetched. Otherwise, the latest
		 * metric value (if existing) will be fetched.
		 * 
		 * @param string|number metric name or constant
		 * @param Date optional start of time period
		 * @param Date optional end of time period
		 * @param string optional granularity (second, minute, hour, day)
		 *
		 * @return mixed|false
		 */
		get: function(metric, start, end, granularity, cb) {

			if (isMetric(metric)) {
				
				// interval specified, look up all values in between
				if (typeof start == 'number' && typeof end == 'number') {

					// default to granularity of 1s
					if (!_.contains(granularities, granularity)) {
						if (typeof granularity == 'function')
							cb = granularity;

						granularity = 'second';
					}

					// fetch values for each granularity between interval

					var fetched = {};

					var inc = grainIntervals[granularity];

					var cur = Util.roundTimestamp(start);
					// TODO do we really want to skip here?
					if (cur < start)
						cur += inc;

					// how many queries will we be firing off?
					var queriesLeft = Math.floor((end - cur) / inc) + 1;

					while (cur <= end) {
						var ts = cur;

						// look up the key for this granularity timestamp
						provider.get(ts + '.' + metric + '.' + granularity, function(key, err) {

							if (err || !key) {
								// woo hoo! we are done
								if (--queriesLeft == 0 && typeof cb == 'function')
									cb(fetched);

								return;
							}
							
							// look up the actual value
							provider.get(key, function(val, err) {
								if (!err)
									fetched[ts] = val.v;

								// woo hoo! we are done
								if (--queriesLeft == 0 && typeof cb == 'function')
									cb(fetched);
							});
						});

						cur += inc;
					}

				// otherwise, look up latest metric
				} else {
					// look up the latest key
					provider.get(metric, function(key, err) {
						if (err || !key)
							return start(null, true);

						// look up the actual value
						provider.get(key, start);
					});
				}

			} else {
				// replace first character of strings
				return (typeof metric == 'string') ? metric.substr(1) : metric;
			}
		},

		/**
		 * Saves a metric to the datastore.
		 * In reality, the metric will be saved in several clever places
		 * to make it easier for the type of retrieval we do. 
		 *
		 * @param string metric name
		 * @param mixed val
		 * @param timestamp false for current timestamp
		 * @param function cb
		 *
		 * @return boolean
		 */
		save: function(metric, val, timestamp, cb) {

			if (typeof timestamp != 'number') {
				if (typeof timestamp == 'function' && !cb)
					cb = timestamp;

				timestamp = Util.timestamp(new Date());
			}

			timestamp = Math.floor(timestamp);

			var obj = {
				t: timestamp,
				v: val
			};

			// key = metric.timestamp
			var key = metric + '.' + timestamp;

			/*
				When adding a metric, it should be stored in the following places:
				- key => obj
				- metric_name => key
				- for each granularity:
					granularity_timestamp.metric.granularity => key
			*/

			// save value to key
			provider.set(key, obj, function(err) {
				if (err)
					return cb(null, err);

				// save value as newest version of metric
				provider.set(metric, key, function(err) {
					if (err)
						return cb(null, err);

					// save each granularity
					_.each(granularities, function(granularity) {
						var key2 = Util.roundTimestamp(timestamp, granularity) + '.' + metric + '.' + granularity;
						provider.set(key2, key);
					});

					cb();
				});
			});
		}

	};

};

exports.isMetric = isMetric;