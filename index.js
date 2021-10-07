const fs = require('fs')
const util = require('util')
const childProcess = require('child_process')
const path = require('path')
const debug = require('debug')('regedit')
const errors = require('./errors.js')
const StreamSlicer = require('stream-slicer')
const through2 = require('through2')
const helper = require('./lib/helper.js')
const execFile = require('./lib/execFile.js')()
const cscript = require('./lib/cscript.js')

/*
 * 	Access the registry without using a specific os architecture, this means that on a 32bit process on a 64bit machine
 * 	when we access hklm\software we will actually be accessing hklm\software\wow6432node.
 */
const OS_ARCH_AGNOSTIC = 'A'

/*
 * 	Access the registry using a specific os architecture, but determine what the architecture is automatically
 * 	This means that accessing in order to access the 32bit software registry on a 64bit machine we will need to
 * 	use the key hklm\software\wow6432node
 */
const OS_ARCH_SPECIFIC = 'S'

/*
 * 	Access the registry using 32bit os architecture
 */
const OS_ARCH_32BIT = '32'

/*
 * 	Access the registry using 64bit os architecture, this will have no effect on 32bit process/machines
 */
const OS_ARCH_64BIT = '64'

/*
 * 	If this value is set the module will change directory of the VBS to the appropriate location instead of the local VBS folder
 */
let externalVBSFolderLocation

function handleErrorsAndClose(child, callback) {
	let error
	child.once('error', function (e) {
		debug('process error %s', e)
		error = e
	})

	child.once('close', function (code) {
		debug('process exit with code %d', code)

		if (error) {
			if (error.code in errors) {
				return callback(errors[error.code])
			}
			return callback(error)

		}

		if (code !== 0) {
			if (code in errors) {
				return callback(errors[code])
			}
			return callback(new Error('vbscript process reported unknown error code ' + code))

		}

		callback()
	})
}

function execute(args, callback, buffersize) {
	if (typeof callback !== 'function') {
		throw new Error('missing callback')
	}

	if (typeof buffersize !== 'number' && typeof buffersize !== 'undefined') {
		throw new Error('invalid buffersize')
	}

	debug(args)

	cscript.init(function (err) {
		if (err) {
			return callback(err)
		}

		var cpArgs = buffersize === undefined ? { maxBuffer: buffersize } : {};

		childProcess.execFile(cscript.path(), args, cpArgs, function (err, stdout, stderr) {

			if (err) {
				if (stdout) {
					console.log(stdout)
				}

				if (stderr) {
					console.error(stderr)
				}

				if (err.code in errors) {
					return callback(errors[err.code])
				}
				return callback(err)

			}

			// in case we have stuff in stderr but no real error
			if (stderr) {
				return callback(new Error(stderr))
			}
			if (!stdout) {
				return callback()
			}

			debug(stdout)

			let result
			err = null

			try {
				result = JSON.parse(stdout)
			} catch (e) {
				e.stdout = stdout
				err = e
			}

			callback(err, result)
		})
	})
}

function spawnEx(args, keys, callback, buffersize) {
	cscript.init(function (err) {
		if (err) {
			return callback(err)
		}

		debug(args)

		var childArgs = { encoding: 'utf8' }

		if (typeof (buffersize) == 'number') {
			childArgs.bufferSize = buffersize;
		}

		const child = execFile(cscript.path(), args, { encoding: 'utf8' })

		handleErrorsAndClose(child, callback)

		helper.writeArrayToStream(keys, child.stdin)
	})
}

//TODO: move to helper.js?
function renderValueByType(value, type) {
	type = type.toUpperCase()

	switch (type) {
		case 'REG_NONE':
			if (value === '') {
				return '\0'
			}
			return value

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

		case 'REG_SZ':
			if (value === '') {
				return '\0'
			}
			return value

		default:
			return value
	}
}

//TODO: move to helper.js?
function baseCommand(cmd, arch) {
	let scriptPath

	// test undefined, null and empty string
	if (externalVBSFolderLocation && typeof (externalVBSFolderLocation) === 'string') {
		scriptPath = externalVBSFolderLocation
	} else {
		scriptPath = path.join(__dirname, 'vbs')
	}

	return ['//Nologo', path.join(scriptPath, cmd), arch]
}

//TODO: move to helper.js?
function toCommandArgs(cmd, arch, keys) {
	let result = baseCommand(cmd, arch)
	if (typeof keys === 'string') {
		result.push(keys)
	} else if (util.isArray(keys)) {
		result = result.concat(keys)
	} else {
		debug('creating command without using keys %s', keys ? keys : '')
	}

	return result
}

module.exports.setExternalVBSLocation = function (newLocation) {
	if (fs.existsSync(newLocation)) {
		externalVBSFolderLocation = newLocation
		return 'Folder found and set'
	}

	return 'Folder not found'
}

module.exports.list = function (keys, architecture, callback, buffersize) {
	//console.log('list with callback will be deprecated in future versions, use list streaming interface')

	if (architecture === undefined) {
		callback = undefined
		architecture = OS_ARCH_AGNOSTIC
	} else if (typeof architecture === 'function') {
		buffersize = callback
		callback = architecture
		architecture = OS_ARCH_AGNOSTIC
	}

	if (typeof keys === 'string') {
		keys = [keys]
	}

	if (typeof callback === 'function') {
		execute(toCommandArgs('regList.wsf', architecture, keys), callback, buffersize)
	} else {
		const outputStream = through2.obj(helper.vbsOutputTransform)

		cscript.init(function (err) {
			if (err) {
				return outputStream.emit('error', err)
			}

			const args = baseCommand('regListStream.wsf', architecture)

			const child = execFile(cscript.path(), args, { encoding: 'utf8', bufferSize: buffersize }, function (err) {
				if (err) {
					outputStream.emit('error', err)
				}
			})

			child.stderr.pipe(process.stderr)

			const slicer = new StreamSlicer({ sliceBy: helper.WIN_EOL })

			child.stdout.pipe(slicer).pipe(outputStream)

			helper.writeArrayToStream(keys, child.stdin)
		})

		return outputStream
	}
}

module.exports.createKey = function (keys, architecture, callback, buffersize) {
	if (typeof architecture === 'function') {
		buffersize = callback
		callback = architecture
		architecture = OS_ARCH_AGNOSTIC
	}

	if (typeof keys === 'string') {
		keys = [keys]
	}

	const args = baseCommand('regCreateKey.wsf', architecture)

	spawnEx(args, keys, callback, buffersize)
}

module.exports.deleteKey = function (keys, architecture, callback, buffersize) {
	if (typeof architecture === 'function') {
		buffersize = callback
		callback = architecture
		architecture = OS_ARCH_AGNOSTIC
	}

	if (typeof keys === 'string') {
		keys = [keys]
	}

	const args = baseCommand('regDeleteKey.wsf', architecture)

	spawnEx(args, keys, callback, buffersize)
}

module.exports.deleteValue = function (keys, architecture, callback, buffersize) {
	if (typeof architecture === 'function') {
		buffersize = callback
		callback = architecture
		architecture = OS_ARCH_AGNOSTIC
	}

	if (typeof keys === 'string') {
		keys = [keys]
	}

	var args = baseCommand('regDeleteValue.wsf', architecture)

	spawnEx(args, keys, callback, buffersize)
}

module.exports.putValue = function (map, architecture, callback, buffersize) {
	if (typeof architecture === 'function') {
		buffersize = callback
		callback = architecture
		architecture = OS_ARCH_AGNOSTIC
	}

	const args = baseCommand('regPutValue.wsf', architecture)

	let values = []

	for (const key in map) {
		if (map.hasOwnProperty(key)) {
			const keyValues = map[key]

			for (const valueName in keyValues) {
				if (keyValues.hasOwnProperty(valueName)) {
					const entry = keyValues[valueName]

					// helper writes the array to the stream in reversed order
					values.push(entry.type)
					values.push(renderValueByType(entry.value, entry.type))
					values.push(valueName)
					values.push(key)
				}
			}
		}
	}

	spawnEx(args, values, callback, buffersize)
}

module.exports.promisified = {
	list: function (keys, architecture = OS_ARCH_AGNOSTIC, buffersize) {
		return new Promise(function (resolve, reject) {
			module.exports.list(keys, architecture, function (err, res) {
				if (err) {
					return reject(err)
				}
				return resolve(res)

			}, buffersize)
		})
	},
	createKey: function (keys, architecture = OS_ARCH_AGNOSTIC, buffersize) {
		return new Promise(function (resolve, reject) {
			module.exports.createKey(keys, architecture, function (err) {
				if (err) {
					return reject(err)
				}
				return resolve()

			}, buffersize)
		})
	},
	deleteKey: function (keys, architecture = OS_ARCH_AGNOSTIC, buffersize) {
		return new Promise(function (resolve, reject) {
			module.exports.deleteKey(keys, architecture, function (err) {
				if (err) {
					return reject(err)
				}
				return resolve()

			}, buffersize)
		})
	},
	deleteValue: function (keys, architecture = OS_ARCH_AGNOSTIC, buffersize) {
		return new Promise(function (resolve, reject) {
			module.exports.deleteValue(keys, architecture, function (err) {
				if (err) {
					return reject(err)
				}
				return resolve()

			}, buffersize)
		})
	},
	putValue: function (map, architecture = OS_ARCH_AGNOSTIC, buffersize) {
		return new Promise(function (resolve, reject) {
			module.exports.putValue(map, architecture, function (err) {
				if (err) {
					return reject(err)
				}
				return resolve()

			}, buffersize)
		})
	},
}

module.exports.arch = {}

module.exports.arch.list = function (keys, callback, buffersize) {
	return module.exports.list(keys, OS_ARCH_SPECIFIC, callback, buffersize)
}

module.exports.arch.list32 = function (keys, callback, buffersize) {
	return module.exports.list(keys, OS_ARCH_32BIT, callback, buffersize)
}

module.exports.arch.list64 = function (keys, callback, buffersize) {
	return module.exports.list(keys, OS_ARCH_64BIT, callback, buffersize)
}

module.exports.arch.createKey = function (keys, callback, buffersize) {
	return module.exports.createKey(keys, OS_ARCH_SPECIFIC, callback, buffersize)
}

module.exports.arch.createKey32 = function (keys, callback, buffersize) {
	return module.exports.createKey(keys, OS_ARCH_32BIT, callback, buffersize)
}

module.exports.arch.createKey64 = function (keys, callback, buffersize) {
	return module.exports.createKey(keys, OS_ARCH_64BIT, callback, buffersize)
}

module.exports.arch.deleteKey = function (keys, callback, buffersize) {
	return module.exports.deleteKey(keys, OS_ARCH_SPECIFIC, callback, buffersize)
}

module.exports.arch.deleteKey32 = function (keys, callback, buffersize) {
	return module.exports.deleteKey(keys, OS_ARCH_32BIT, callback, buffersize)
}

module.exports.arch.deleteKey64 = function (keys, callback, buffersize) {
	return module.exports.deleteKey(keys, OS_ARCH_64BIT, callback, buffersize)
}

module.exports.arch.deleteValue = function (keys, callback, buffersize) {
	return module.exports.deleteValue(keys, OS_ARCH_SPECIFIC, callback, buffersize)
}

module.exports.arch.deleteValue32 = function (keys, callback, buffersize) {
	return module.exports.deleteValue(keys, OS_ARCH_32BIT, callback, buffersize)
}

module.exports.arch.deleteValue64 = function (keys, callback, buffersize) {
	return module.exports.deleteValue(keys, OS_ARCH_64BIT, callback, buffersize)
}

module.exports.arch.putValue = function (keys, callback, buffersize) {
	return module.exports.putValue(keys, OS_ARCH_SPECIFIC, callback, buffersize)
}

module.exports.arch.putValue32 = function (keys, callback, buffersize) {
	return module.exports.putValue(keys, OS_ARCH_32BIT, callback, buffersize)
}

module.exports.arch.putValue64 = function (keys, callback, buffersize) {
	return module.exports.putValue(keys, OS_ARCH_64BIT, callback, buffersize)
}

module.exports.arch.promisified = {
	list: function (keys, buffersize) {
		return module.exports.promisified.list(keys, OS_ARCH_SPECIFIC, buffersize)
	},
	list32: function (keys, buffersize) {
		return module.exports.promisified.list(keys, OS_ARCH_32BIT, buffersize)
	},
	list64: function (keys, buffersize) {
		return module.exports.promisified.list(keys, OS_ARCH_64BIT, buffersize)
	},
	createKey: function (keys, buffersize) {
		return module.exports.promisified.createKey(keys, OS_ARCH_SPECIFIC, buffersize)
	},
	createKey32: function (keys, buffersize) {
		return module.exports.promisified.createKey(keys, OS_ARCH_32BIT, buffersize)
	},
	createKey64: function (keys, buffersize) {
		return module.exports.promisified.createKey(keys, OS_ARCH_64BIT, buffersize)
	},
	deleteKey: function (keys, buffersize) {
		return module.exports.promisified.deleteKey(keys, OS_ARCH_SPECIFIC, buffersize)
	},
	deleteKey32: function (keys, buffersize) {
		return module.exports.promisified.deleteKey(keys, OS_ARCH_32BIT, buffersize)
	},
	deleteKey64: function (keys, buffersize) {
		return module.exports.promisified.deleteKey(keys, OS_ARCH_64BIT, buffersize)
	},
	deleteValue: function (keys, buffersize) {
		return module.exports.promisified.deleteValue(keys, OS_ARCH_SPECIFIC, buffersize)
	},
	deleteValue32: function (keys, buffersize) {
		return module.exports.promisified.deleteValue(keys, OS_ARCH_32BIT, buffersize)
	},
	deleteValue64: function (keys, buffersize) {
		return module.exports.promisified.deleteValue(keys, OS_ARCH_64BIT, buffersize)
	},
	putValue: function (keys, buffersize) {
		return module.exports.promisified.putValue(keys, OS_ARCH_SPECIFIC, buffersize)
	},
	putValue32: function (keys, buffersize) {
		return module.exports.promisified.putValue(keys, OS_ARCH_32BIT, buffersize)
	},
	putValue64: function (keys, buffersize) {
		return module.exports.promisified.putValue(keys, OS_ARCH_64BIT, buffersize)
	},
}
