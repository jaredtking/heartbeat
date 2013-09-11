# heartbeat.js [![Build Status](https://travis-ci.org/jaredtking/heartbeat.png?branch=master)](https://travis-ci.org/jaredtking/heartbeat)

### Server for monitoring your ElasticSearch

In today's connected world, many systems, processes, and services run on one's behalf in the background, often hidden out of site. As we continue to automate our lives and the systems around us, it is useful to know what they are up to. If these systems may be measured in any way then it can be determined if a system is functioning correctly or if it is even functioning at all.

*Enter Heartbeat.*

Heartbeat facilitates monitoring of metrics and generates alerts based on a flexible set of rules. Metrics are [ElasticSearch](http://www.elasticsearch.org/) queries.

One needs not think of systems as strictly software running on servers. A system may be something in the physical world, like a business. If it generates data that can be stored in Elasticsearch then it can be monitored by Heartbeat. Please see the use cases for examples of how Heartbeat may be used.

## Goal

Send alerts (email, sms, push notification, webhook) based on scheduled rules.

## Use cases

### Cron jobs and background services

Verify that services are running by receiving alerts when something fails or does not execute. For example, if ElasticSearch knows when jobs have been ran then an alert may be setup to occur if a job has not successfully finished within the last hour.

### Business

Monitor the health of your business with Heartbeat and be notified as soon as dips in traffic, signups, or revenue are detected.

An example for a web app: if no new signups were made in the last 3 days, an alert could be sent.

### Hardware

With the internet of things it is now possible to communicate with circuits interfacing with real hardware, such as [Raspberry Pi](http://www.raspberrypi.org/). Possibilities include generating alerts whenever a switch is triggered or a sensor exceeds a threshold.

### Personal

Track metrics about yourself, such as health and productivity.

### Real-time Streams

ElasticSearch can have data firehosed in from real-time sources, like Twitter. Alerts could be setup based on custom queries.

### Who knows?

Almost any type of information can be pumped into ElasticSearch. Heartbeat will be there to alert you what is happening with your data.

## Metrics

At the core of heartbeat is the tracking of various metrics. Metrics are defined as ElasticSearch queries.

### Nomenclature

Metrics are denoted with dot notation. Each dot delimits another category. For example, ``servers.dallas.cpu`` references the metric ``cpu`` which is in the ``dallas`` category which is in the ``servers`` category. There are no limits to how deep metrics may be nested.

### TODO

Specify how metrics are defined.

## Alert Rules

Rules define the criteria for which an alert will be generated.

Each rule consists of:
- condition
- alert
- schedule

### Condition

These are the condition(s) that trigger an alert. A condition string evaluates into a boolean value. When true, the alert will be fired, otherwise, the no action will be taken.

#### Operators

Conditions contain at least one operator. Every operator generates a boolean, true or false, and may take any number of arguments depending on the operator. For example, the `>` operator takes two arguments, a left and right side.

Available operators:
- `>`
- `<`
- `>=`
- `<=`
- `=`
- `<>` - not equal
- `not`
- `or`
- `and`

##### Arguments

Arguments can be another operator (please see example below), the name of a metric, or a constant. The name of a metric is simply a string. A constant may be a string, number or boolean value. In order to use a string as a constant, you must prefix a `#` to the string, like the example below.

#### Nesting

Nesting can be achieved by using building a tree of boolean operators.

Currently, conditions are defined as nested objects for simplicity.

### Schedule

Schedule rules check for alert conditions according to a [later](http://bunkat.github.io/later) schedule. Possibilities include checking for a condition every hour, once a week, or on a particular date. A valid later schedule must be supplied to 

### Alert

The alert specifies where and how an alert should be sent. An alert may contain one or more endpoints with an array of endpoints. Initially, e-mail and sms will be supported.

### Example

Trigger:
```js
rule = {
	type: 'trigger',
	condition: { // translates to op(a,b)
		op: '>'
		0: 'servers.dallas.cpu'
		1: 90
 	},
 	alert: {
 		type: 'email',
 		endpoint: 'johnny@appleseed.com'
 	}
}
```

Schedule:
```js
rule = {
	type: 'schedule',
	condition: {
		op: 'not',
		0: 'services.database.pulse'
	},
 	alert: [
	 	{
	 		type: 'sms',
	 		endpoint: '1234567890'
	 	},
	 	{
	 		type: 'sms',
	 		endpoint: '0987654321'
	 	}
	],
 	schedule: later.parse.text('every 1 hour')
}
```

Nesting:
```js
rule = {
	type: 'trigger',
	condition: {
		op: 'or',
		0: {
			op: '=',
			0: 'error',
			1: '#The server is down.'
		},
		1: {
			op: '=',
			0: 'error',
			1: '#I have given up.'
		},
		2: {
			op: '',
			0: 'error',
			1: '#You sunk my battleship.'
		}
	},
 	alert:
 	{
 		type: 'sms',
 		endpoint: '1234567890'
 	}
}
```

## Configuration

Heartbeat has a collection of JSON configuration files that control everything, including rules and alert settings. The available configuration files are:
```sh
server.json
rules.json
```

### Alert Settings

#### E-mail (SMTP)

Alerts may be sent over e-mail with SMTP credentials. The SMTP settings are located in ``server.json``.

#### SMS (Twilio)

Heartbeat can send alerts via SMS if [Twilio](http://twilio.com) credentials are supplied in ``server.json``.

## Usage

Installation with npm:
```sh
sudo npm -g install heartbeat
```

Creating a new Heartbeat server with a custom name:
```sh
heartbeat new myHeartbeat
```

A directory with the server name will be created and filled with sample configuration files. At minimum, the database credentials must be supplied before firing up the server.

The server can be started with:
```sh
heartbeat start
```

## Privacy

Since Heartbeat is self-hosted, you have complete control over your data. It is **highly recommended that TLS is used with Heartbeat** in order to ensure privacy since the API is plaintext over HTTP.

## Dude, where's my code?

I have chosen to follow [Readme Driven Development](http://tom.preston-werner.com/2010/08/23/readme-driven-development.html) by Tom Preston-Warner for this project, meaning that the code will come in time. This document outlines what will be built and has been used to organize my thoughts. As the code and new thoughts appear, this document will be updated.

### What's next?

The plan is to build this project in node.js. I believe it is the most fitting tool given how awesome it is at event handling and concurrency.

- ~~Define alert rule parameters~~
- Setup code w/ tests for prototype functionality
	- ~~rule validation~~
	- ~~rule scheduling~~
	- metrics to elastic search query mapping
	- e-mail alerts
	- sms alerts
- Configuration files
	- server.json
	- rules.json
- CLI interface
	- `heartbeat new`
	- `heartbeat start`
	- `heartbeat stop`

## License

The MIT License (MIT)

Copyright © 2013 Jared King

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
