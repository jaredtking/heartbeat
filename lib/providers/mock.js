MockStorage = function() {
	this.storage = {};
};

MockStorage.prototype.get = function(key, cb) {

	if (typeof cb != 'function')
		return;

	if (typeof this.storage[key] != 'undefined')
		cb(this.storage[key]);
	else
		cb(null, true);
};

MockStorage.prototype.set = function(key, value, cb) {

	this.storage[key] = value;

	if (typeof cb == 'function')
		cb();
};

MockStorage.prototype.addTo = function(key, value, cb) {

	if (!(this.storage[key] instanceof Array))
		this.storage[key] = [];

	this.storage[key].push(value);

	if (typeof cb == 'function')
		cb();
};

module.exports = MockStorage;