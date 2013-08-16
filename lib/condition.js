var _ = require('underscore'),
	check = require('validator').check;

module.exports = function(condition) {

	var operators = {
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

	function condIsValid(cond) {
		
		if (typeof cond != 'object') {
			try {
				check(cond).len(1).notContains(' ');
			} catch (e) {
				return false;
			}

			return true;
		}

		// look for a valid operator
		var operator = operators[cond.op];
		if (typeof operator != 'object')
			return false;

		// look up the number of arguments in 
		var numArgs = -1;
		while (typeof cond[++numArgs] != 'undefined') ;

		// check for correct number of arguments
		if (numArgs < operator.args)
			return false;

		// recursively validate each argument
		for (var i = 0; i < operator.args; i++) {
			if (!condIsValid(cond[i]))
				return false;
		}

		return true;
	}

	function condMetricNames(cond) {

		if (typeof cond != 'object') {
			if (typeof cond == 'string')
				return cond;

			return [];
		}

		var names = [];

		var numArgs = -1;
		while (typeof cond[++numArgs] != 'undefined') {
			names = names.concat(condMetricNames(cond[numArgs]));
		}

		return names;
	}

	function evalCond(evaluator, cond) {

		if (typeof cond != 'object')
			return cond;
		
		// collect and recursively evaluate each argument
		var numArgs = -1;
		var args = [evaluator];
		while (typeof cond[++numArgs] != 'undefined')
			args.push(evalCond(evaluator, cond[numArgs]));

		// call the operator function
		return operators[cond.op].func.apply({}, args);
	}

	return {

		/** 
		 * Recursively checks if a condition and its operators are valid
		 *
		 * @return boolean
		 */
		isValid: function() {
			return condIsValid(condition);
		},

		/** 
		 * Recursively retrieves the names of all the metrics in a condition
		 *
		 * @return Array
		 */
		metricNames: function() {
			return condMetricNames(condition);
		},

		/** 
		 * Recursively evaluates a condition, assumes a valid condition has been supplied
		 *
		 * @param Metrics.evaluator
		 *
		 * @return boolean
		 */
		evaluate: function(evaluator) {
			return evalCond(evaluator, condition);
		},

	};
}