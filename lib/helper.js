var debug = require('debug')('regedit')
var WIN_EOL = module.exports.WIN_EOL = '\r\n'

module.exports.encode = function(str) {
	return escape(str) + WIN_EOL
}

/*
 *	Write an array to a stream, taking backpressure into consideration
 */
module.exports.writeArrayToStream = function(arr, stream, optionalCallback) {
	var member = arr.next()

	function write(m) {
		var b = module.exports.encode(m)
		debug(b)
		return stream.write(b)
	}
	
	while (!member.done && write(member.value[1])) {
		member = arr.next()
	}

	if (member.done) {
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
