var childProcess = require('child_process')

module.exports = function(options) {
	options = options || {}

	return function execFile (command, args, opts, callback) {

		var child = childProcess.execFile(command, args, opts, callback)

		if (!options.bufferStdout) {			
			child.stdout.removeAllListeners('data')
		}

		if (!options.bufferStderr) {			
			child.stderr.removeAllListeners('data')
		}

		return child
	}
}
