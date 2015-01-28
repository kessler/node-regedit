var util = require('util')
var child = require('child_process')
var path = require('path')
var debug = require('debug')('regedit')
var errors = require('./errors.js')

module.exports.list = function (registryPaths, callback) {
	executeCommand('regList.wsf', registryPaths, callback)
}

module.exports.createKey = function (keys, callback) {
	executeCommand('regCreateKey.wsf', keys, callback)
}

module.exports.deleteKey = function (keys, callback) {
	executeCommand('regDeleteKey.wsf', keys, callback)
}

module.exports.putValue = function(map, callback) {
	
	var keys = []

	for (var key in map) {		
		var values = map[key]
		for (var valueName in values) {
			var entry = values[valueName]
			var line = key + ' ' + valueName + ' ' 
						+ renderValueByType(entry.value, entry.type) + ' ' 
						+ entry.type

			keys.push(line)
		}
	}

	executeCommand('regPutValue.wsf', keys, callback)
}

function executeCommand(cmd, keys, callback) {

	cmd += ' '

	if (typeof(keys) === 'string') {
		cmd += keys
	} else if (util.isArray(keys)) {
		cmd += keys.join(' ')
	} else {
		throw new Error('missing or invalid keys, try a string or an array of strings')
	}

	if (typeof callback !== 'function') {
		throw new Error('missing callback')
	}

	execChildProcess(cmd, callback)	
}

function execChildProcess(cmd, callback) {
	cmd = 'cscript.exe //Nologo ' + path.join(__dirname, 'vbs', cmd)
	
	debug(cmd)

	child.exec(cmd, function (err, stdout, stderr) {	

		if (err) {
			console.log(stdout)
			if (err.code in errors) {
				return callback(errors[err.code])
			} else {
				return callback(err)
			}
		}

		if (stderr) return callback(new Error(stderr))
	
		var result
		try {
			result = JSON.parse(stdout)
		} catch (e) {
			result = stdout
		}

		callback(null, result)
	})
}

function renderValueByType(value, type) {
	type = type.toUpperCase()

	switch (type) {
		case 'REG_BINARY':
			if (!util.isArray(value)) {
				throw new Error('invalid value type ' + typeof (value) + ' for registry type REG_BINARY, please use an array of numbers')
			}
			return value.join(',')

		case 'REG_MULTI_SZ':
			if (!util.isArray(value)) {
				throw new Error('invalid value type ' + typeof (value) + ' for registry type REG_BINARY, please use an array of strings')
			}
			return value.join(',')

		default:
			return value
	}
}