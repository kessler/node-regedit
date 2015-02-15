var util = require('util')
var child = require('child_process')
var path = require('path')
var debug = require('debug')('regedit')
var errors = require('./errors.js')
var os = require('os')

module.exports.list = function (keys, callback) {
	executeCommand(prepareCommand('regList.wsf', keys), callback)
}

module.exports.arch = {}

var arch = os.arch() === 'x64' ? '64' : '32'

module.exports.getArch = function () {
	return arch
}

module.exports.arch.list = function(keys, callback) {
	
	if (arch === '64') {
		return module.exports.arch.list64(keys, callback)
	} else {
		return module.exports.arch.list32(keys, callback)
	}
}

module.exports.arch.list32 = function (keys, callback) {
	executeCommand(prepareCommand('regList.wsf', keys, '32'), callback)
}

module.exports.arch.list64 = function (keys, callback) {
	executeCommand(prepareCommand('regList.wsf', keys, '64'), callback)
}

module.exports.createKey = function (keys, callback) {
	executeCommand(prepareCommand('regCreateKey.wsf', keys), callback)
}

module.exports.deleteKey = function (keys, callback) {
	executeCommand(prepareCommand('regDeleteKey.wsf', keys), callback)
}

module.exports.putValue = function(map, callback) {
	
	var cmd = 'regPutValue.wsf *'

	for (var key in map) {		
		var values = map[key]
		for (var valueName in values) {
			var entry = values[valueName]
			var line = wrapDoubleQuotes(key) + ' ' + wrapDoubleQuotes(valueName) + ' ' 
						+ wrapDoubleQuotes(renderValueByType(entry.value, entry.type)) + ' ' 
						+ entry.type

			cmd += ' ' + line
		}
	}

	executeCommand(cmd, callback)
}

function executeCommand(cmd, callback) {

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
			if (stdout) {
				console.log(stdout)
			}

			if (stderr) {
				console.error(stderr)
			}

			if (err.code in errors) {
				return callback(errors[err.code])
			} else {
				return callback(err)
			}
		}

		// in case we have stuff in stderr but no real error
		if (stderr) return callback(new Error(stderr))
	
		debug(stdout, stderr)

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

function prepareCommand(cmd, args, architecture) {
	architecture = architecture || '*'

	cmd += ' ' + architecture

	if (typeof args === 'string') {
		return cmd += ' ' + wrapDoubleQuotes(args)
	} else if (util.isArray(args)) {
		return cmd += ' ' + wrapItemsWithDoubleQuotes(args)
	} else {
		return cmd
	}
}

function wrapItemsWithDoubleQuotes(arr) {
	var result = ''

	for (var i = 0; i < arr.length; i++) {
		if (i > 0)
			result += ' '

		result += wrapDoubleQuotes(arr[i])		
	}

	return result
}

/*
 * conditionally wrap items with double quotes if they aren't wrapped already
 */
function wrapDoubleQuotes(item) {
	if (item[0] !== '"' && item[item.length - 1] !== '"') {
		return '"' + item + '"'
	}

	return item
}