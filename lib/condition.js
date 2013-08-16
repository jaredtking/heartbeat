var _ = require('underscore'),
	check = require('validator').check;

var Condition = function(condition) {
	this.condition = condition;
};

Condition.operators = {
	'>': {
		args: 2,
		func: function(e, a, b) {
			return e.get(a) > e.get(b);
		}
	},
	'>=': {
		args: 2,
		func: function(e, a, b) {
			return e.get(a) >= e.get(b);
		}
	},
	'<': {
		args: 2,
		func: function(e, a, b) {
			return e.get(a) < e.get(b);
		}
	},
	'<=': {
		args: 2,
		func: function(e, a, b) {
			return e.get(a) <= e.get(b);
		}
	},
	'=': {
		args: 2,
		func: function(e, a, b) {
			return e.get(a) == e.get(b);
		}
	},
	'<>': {
		args: 2,
		func: function(e, a, b) {
			return e.get(a) != e.get(b);
		}
	},
	'not': {
		args: 1,
		func: function(e, a) {
			return !e.get(a);
		}
	},
	'or': {
		args: 2,
		func: function(e) {
			var rargs = Array.prototype.slice.call(arguments);

			// evaluate each argument
			var args = [];
			for (var i in rargs) {
				if (i > 0)
					args.push(e.get(rargs[i]));
			}

			return _.reduce(args, function(a,b) { return a || b; }, false);
		}
	},
	'and': {
		args: 2,
		func: function(e) {
			var rargs = Array.prototype.slice.call(arguments);

			// evaluate each argument
			var args = [];
			for (var i in rargs) {
				if (i > 0)
					args.push(e.get(rargs[i]));
			}

			return _.reduce(args, function(a,b) { return a && b; }, true);
		}
	}
};

/** 
 * Recursively checks if a condition and its operators are valid
 *
 * @return boolean
 */
Condition.prototype.isValid = function(condition) {

	if (typeof condition == 'undefined')
		condition = this.condition;
	
	if (typeof condition != 'object') {
		try {
			check(condition).len(1).notContains(' ');
		} catch (e) {
			return false;
		}

		return true;
	}

	// look for a valid operator
	var operator = Condition.operators[condition.op];
	if (typeof operator != 'object')
		return false;

	// look up the number of arguments in 
	var numArgs = -1;
	while (typeof condition[++numArgs] != 'undefined') ;

	// check for correct number of arguments
	if (numArgs < operator.args)
		return false;

	// recursively validate each argument
	for (var i = 0; i < operator.args; i++) {
		if (!this.isValid(condition[i]))
			return false;
	}

	return true;
};

/** 
 * Recursively retrieves the names of all the metrics in a condition
 *
 * @param object|string condition
 *
 * @return Array
 */
Condition.prototype.metricNames = function(condition) {

	if (typeof condition == 'undefined')
		condition = this.condition;

	if (typeof condition != 'object') {
		if (typeof condition == 'string')
			return condition;

		return [];
	}

	var names = [];

	var numArgs = -1;
	while (typeof condition[++numArgs] != 'undefined') {
		names = names.concat(this.metricNames(condition[numArgs]));
	}

	return names;
},

/** 
 * Recursively evaluates a condition, assumes a valid condition has been supplied
 *
 * @param object|string condition
 * @param Metrics.evaluator
 *
 * @return boolean
 */
Condition.prototype.evaluate = function(evaluator, condition) {

	if (typeof condition == 'undefined')
		condition = this.condition;

	if (typeof condition != 'object')
		return condition;
	
	// collect and recursively evaluate each argument
	var numArgs = -1;
	var args = [evaluator];
	while (typeof condition[++numArgs] != 'undefined')
		args.push(this.evaluate(evaluator,condition[numArgs]));

	// call the operator function
	return Condition.operators[condition.op].func.apply({}, args);
},

module.exports = Condition;