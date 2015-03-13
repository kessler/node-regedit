var DOUBLY_ESCAPED_WIN_EOL = module.exports.DOUBLY_ESCAPED_WIN_EOL = '\\\\\\\\r\\\\\\\\n'
var DOUBLY_ESCAPED_WIN_EOL_MATCHER = module.exports.DOUBLY_ESCAPED_WIN_EOL_MATCHER = /\\\\\\\\r\\\\\\\\n/g
var ESCAPED_WIN_EOL = module.exports.ESCAPED_WIN_EOL = '\\r\\n'
var WIN_EOL = module.exports.WIN_EOL = '\r\n'

module.exports.unescapeVbsStreamOutput = function(chunk) {
	return chunk.replace(DOUBLY_ESCAPED_WIN_EOL_MATCHER, ESCAPED_WIN_EOL)
}

/*
 *	Write an array to a stream, taking backpressure into consideration
 */
module.exports.writeArrayToStream = function (arr, stream, optionalCallback) {
	var member = arr.pop()

	while (member && stream.write(member + WIN_EOL)) {
		member = arr.pop()
	}

	if (arr.length === 0) {
		stream.write(WIN_EOL)
		
		if (typeof optionalCallback === 'function') {
			optionalCallback()
		}

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

		chunk = module.exports.unescapeVbsStreamOutput(chunk)

		this.push(JSON.parse(chunk))

		callback()
	} catch (e) {		
		callback(e)
	}
}
