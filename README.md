# heartbeat.js [![Build Status](https://travis-ci.org/jaredtking/heartbeat.png?branch=master)](https://travis-ci.org/jaredtking/heartbeat)

Server for monitoring your life

## Introduction

In today's connected world, many systems, processes, and services run on one's behalf in the background, often hidden out of site. As we continue to automate our lives and the systems around us, it is useful to know what they are up to. If these systems may be measured in any way then it can be determined if a system is functioning correctly or if it is even functioning at all.

*Enter Heartbeat.*

Heartbeat facilitates monitoring of metrics and generates alerts based on a flexible set of rules. Metrics are received over ordinary HTTP requests to the API and can be anything (pulse, string, number).

One needs not think of systems as strictly software running on servers. A system may be something in the physical world, like a business. If it generates data then it can be monitored by Heartbeat. Please see the use cases for examples of how Heartbeat may be used.

## Goals

1. Provide an API for collecting data
2. Display data using an interactive dashboard
3. Send alerts (email, sms, push notification, webhook) based on defined rules

## Use cases

### Cron jobs and background services

Verify that services are running by receiving alerts when something fails or does not execute. Pulses can be sent whenever a task has finished with a simple ``curl`` call to Heartbeat. Then an alert may be setup to occur if a job does not finish within an hour, for example.

### Usage metrics

Store data as services are used or consumed. For example, store statistics about how a product or app gets used over time.

### Business

Monitor the health of your business with Heartbeat and be notified as soon as dips in traffic, signups, or revenue are detected.

An example for a web app: if no new signups were made in the last 3 days, an alert could be sent.

### Personal

Track metrics about yourself, such as health and productivity.

### Hardware

With the internet of things it is now possible to communicate with circuits interfacing with real hardware, such as Raspberry Pi, from anywhere with an internet connection. Possibilities include notifications whenever a switch is triggered or a sensor exceeds a threshold.

### Who knows?

Almost any information can be tracked and logged. There are many, many other use cases where Heartbeat is useful, waiting to be discovered.

## Metrics

At the core of heartbeat is the tracking of various metrics. Metrics need not be explicitly defined. Instead, as data comes in, metrics will be created on the fly.

### Nomenclature

Metrics are denoted with dot notation. Each dot delimits another category. For example, ``servers.dallas.cpu`` references the metric ``cpu`` which is in the ``dallas`` category which is in the ``servers`` category. There are no limits to how deep metrics may be nested.

### Timestamps

Every piece of data that comes is assigned a timestamp according to the time it was received by the API.

### Data Types

Data for a metric can be anything: a number, a string, or simply a pulse. Send any piece of data to Heartbeat and it will handle it.

#### Pulse

At the minimum, a metric may be a pulse, that is, a check in at a point of time.

#### Number

Self-explanatory.

#### String

A metric may be any piece of text. If a metric contains at least one string then it's data will be displayed as a log instead of a graph in the dashboard.

## Alert Rules

Rules define the criteria for which an alert will be generated.

Each rule consists of:
- type
- condition
- alert
- schedule

There are 2 types of rules: trigger and schedule.

#### Trigger

Trigger rules checks if an alert should be generated every time one of the included metrics has been updated. For example, a trigger can generate an alert once a value reaches a threshold. An even simpler example would be to generate an alert once an alarm generates a pulse.

#### Schedule

Schedule rules check for alert conditions according to a [later](http://bunkat.github.io/later) schedule. Possibilities include checking for a condition every hour, once a week, or on a particular date. A valid later schedule must be supplied to 

### Condition

These are the condition(s) that trigger an alert. A condition string evaluates into a boolean value. When true, the alert will be fired, otherwise, the no action will be taken.

#### Operators

Conditions contain at least one operator. Every operator generates a boolean, true or false, and may take any number of arguments depending on the operator. For example, the `>` operator takes two arguments, a left and right side. Arguments are named according to 

#### Nesting

Nesting can be achieved by using building a tree of boolean operators.

Currently, conditions are defined as nested objects for simplicity.

### Alert

The alert specifies where and how an alert should be sent. An alert may contain one or more endpoints. Initially, e-mail and sms will be supported.

### Example

Trigger:
```js
rule = {
	type: 'trigger',
	condition: { // translates to op(a,b)
		op: '>'
		0: 'servers.dallas.cpu'
		1met: 90
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
 	alert: {
 		type: 'sms',
 		endpoint: '1234567890'
 	},
 	schedule: later.parse.text('every 1 hour')
}
```

## HTTP API

Data is supplied to Heartbeat via a RESTful API. Every piece of data that comes in must have the name of a metric and a value. The timestamp assigned to the data will be the time the request comes in.

### `POST /metrics/:metric`

### `POST /metrics`

Additonal endpoints for retrieving metrics and managing rules will be added later.

## Configuration

Heartbeat has a collection of JSON configuration files that control everything, including rules and alert settings. The available configuration files are:
```sh
server.json
rules.json
```

### Database

Heartbeat relies on [redis](http://redis.io) as a data store. It is required that redis has persistence enabled.

The credentials for redis must be supplied in ``server.json``.

### Alert Settings

#### SMTP

Alerts may be sent over e-mail with SMTP credentials. The SMTP settings may be set in ``server.json``.

#### Twilio

Heartbeat can be configured to send alerts via SMS if [Twilio](http://twilio.com) credentials are supplied in ``server.json``.

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

The plan is to build this project in node.js. I believe it is the most fitting tool given the requirements of speed and high concurrency.

- Design REST API
- ~~Define alert rule parameters~~
- Setup tests for prototype functionality
	- ~~rule validation~~
	- ~~evaluaton of conditions~~
	- rule scheduling
	- tracking metrics w/ redis
	- e-mail alerts
	- sms alerts
- CLI interface
- Configuration files
	- server.json
	- rules.json
- Rule scheduler
- Build API endpoints for receiving data
- Send alerts
- Web app dashboard

## License

The MIT License (MIT)

Copyright © 2013 Jared King

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
