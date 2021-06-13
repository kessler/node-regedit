var debug = require('debug')('regedit')
var WIN_EOL = module.exports.WIN_EOL = '\r\n'

module.exports.encode = function(str) {
	return escape(str) + WIN_EOL
}

/*
 *	Write an array to a stream, taking backpressure into consideration
 */
module.exports.writeArrayToStream = function(arr, stream, optionalCallback) {
	var member = arr.pop()

	function write(m) {
		if (m !== undefined) {
			var b = module.exports.encode(m)
			debug(b)
			return stream.write(b)
		}

		return false
	}

	while (write(member)) {
		member = arr.pop()
	}

	if (arr.length === 0) {
		stream.write(WIN_EOL, optionalCallback)
		return
	}

	stream.once('drain', function() {
		module.exports.writeArrayToStream(arr, stream, optionalCallback)
	})
}

module.exports.vbsOutputTransform = function(chunk, enc, callback) {
	try {
		if (enc === 'buffer') {
			chunk = chunk.toString()
		} else {
			chunk = chunk.toString(enc)
		}

		this.push(JSON.parse(chunk))
	} catch (e) {
		return callback(e)
	}

	return callback()
}
