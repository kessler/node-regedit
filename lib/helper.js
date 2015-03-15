var debug = require('debug')('regedit')
var DOUBLY_ESCAPED_WIN_EOL = module.exports.DOUBLY_ESCAPED_WIN_EOL = '\\\\r\\\\n'
var DOUBLY_ESCAPED_WIN_EOL_MATCHER = module.exports.DOUBLY_ESCAPED_WIN_EOL_MATCHER = /\\\\r\\\\n/g
var ESCAPED_WIN_EOL = module.exports.ESCAPED_WIN_EOL = '\\r\\n'
var WIN_EOL = module.exports.WIN_EOL = '\r\n'

/*
 *	Write an array to a stream, taking backpressure into consideration
 */
module.exports.writeArrayToStream = function (arr, stream, optionalCallback) {

	var encoding = 'utf8'
	var member = arr.pop()

	function write(m) {
		if (m) {
			var b = escape(m) + WIN_EOL
			debug(b)
			return stream.write(b)
		}
	}

	while (write(member)) {		
		member = arr.pop()
	}

	if (arr.length === 0) {
		stream.write(WIN_EOL, optionalCallback)
		return 
	}

	stream.on('drain', function () {
		writeArrayToStream(arr, stream, callback)
	})
}

module.exports.vbsOutputTransform = function (chunk, enc, callback) {
	try {
		if (enc === 'buffer') {
			chunk = chunk.toString()
		} else {
			chunk = chunk.toString(enc)
		}

		this.push(JSON.parse(chunk))

		callback()
	} catch (e) {		
		callback(e)
	}
}
