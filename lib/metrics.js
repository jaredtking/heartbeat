var Metrics = {
	evaluator: function() {}
};

Metrics.evaluator.prototype.get = function(val) {
	// is this a metric?
	// todo
		// fetch from datastore

	// or a constant?
	// todo

	return val;
};

module.exports = Metrics;