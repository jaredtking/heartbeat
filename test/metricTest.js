var assert = require('assert'),
	_ = require('underscore'),
	metrics = require('../lib/metrics'),
	MockProvider = require('../lib/providers/mock'),
	Util = require('../lib/util');

describe('metrics', function() {

	describe('isMetric', function() {
		it('should return true for valid metric name', function() {
			var valid = [
				'somemetric',
				'metric.test.1.2.3',
				'test123'
			];

			_.each(valid, function(name) {
				assert.ok(metrics.isMetric(name), 'Valid metric name(' + name + ') failed validation');
			});
		});

		it('should return false for invalid metric name', function() {
			var invalid = [
				'this should always fail',
				'fail_test',
				'_1',
				'!@#$%^&*()',
				'',
				'1',
				{},
				[],
				20834,
				4850.50
			];

			_.each(invalid, function(name) {
				assert.ok(!metrics.isMetric(name), 'Invalid metric name(' + name + ') passed validation');
			});
		});
	});

	describe('save', function() {
		it('should save a metric without an error', function(done) {
			var storage  = metrics.storage();

			storage.save('test', 123, function(err) {
				assert.ok(!err);

				done();
			});
		});

		it('should save a metric', function(done) {
			var mock = new MockProvider();
			var storage  = metrics.storage(mock);

			var metricName = 'test.metric.name';
			var metricValue = 'aakl;sjdflkajsdfkl;jasd;klfjsa;kljf ;lsdf';
			var timestamp = Util.timestamp(new Date());

			storage.save(metricName, metricValue, timestamp, function(err) {

				assert.ok(!err);

				mock.get(metricName + '.' + timestamp, function(val, err) {

					assert.ok(!err);

					var test = {
						t: timestamp,
						v: metricValue
					};

					assert.deepEqual(val, test);

					done();
				});
			});
		});
	});

	describe('get', function() {
		it('should get the latest metric', function(done) {
			var storage  = metrics.storage();

			var metricName = 'test.metric.name';
			var metricValue = 'aakl;sjdflkajsdfkl;jasd;klfjsa;kljf ;lsdf';
			var timestamp = Util.timestamp(new Date());

			storage.save(metricName, 'blah', timestamp-100, function(err) {

				assert.ok(!err);

				storage.save(metricName, metricValue, timestamp, function(err) {

					assert.ok(!err);

					storage.get(metricName, function(val, err) {

						assert.ok(!err);

						var test = {
							t: timestamp,
							v: metricValue
						};

						assert.deepEqual(val, test);

						done();
					});
				});

			});
		});

		var granularities = ['second','minute','hour','day'];
		var grainMap = {second:1,minute:60,hour:3600,day:86400};

		_.each(granularities, function(granularity) {
			it('should get a set of metrics for each granularity', function(done) {

			var storage  = metrics.storage();

			var numMetrics = 10;
			var metricName = 'testmetric';

				var metricsLeft = numMetrics;
				var step = grainMap[granularity];

				for (var i = 0; i < numMetrics; i++) {
					var ts = i * step + 5.2;

					storage.save(metricName, i, ts, function (err) {

						if (--metricsLeft == 0) {
							storage.get(metricName, 0, numMetrics * step + 5, granularity, function(vals, err) {

								assert.ok(!err, 'Could not look up metrics for ' + granularity + ' granularity');

								// build verification object
								var verify = {};
								for (var i = 0; i < numMetrics; i++) {
									var ts2 = Util.roundTimestamp(i * step + 5.2, granularity);
									verify[ts2] = i;
								}

								assert.deepEqual(verify, vals, 'Could not verify metrics for ' + granularity + ' granularity.\nTest: ' + JSON.stringify(verify) + '\nActual: ' + JSON.stringify(vals));

								done();
							});
						}
					})
				}
			});
		});
	});
});