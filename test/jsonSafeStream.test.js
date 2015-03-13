var cp = require('child_process')
var should = require('should')
var path = require('path')
var helper = require('../lib/helper.js')
var format = require('util').format
var vbsScript = path.resolve(__dirname, '..', 'vbs', 'JsonSafeStreamTest.wsf')

describe('json safe stream version', function () {
	it('also escapes windows newline', function (done) {
		cp.execFile('cscript', ['/NoLogo',  vbsScript], function(err, stdout, stderr) {
			if (err) return done(err)

			var expected = format('{ "a": "%s"}%s', helper.DOUBLY_ESCAPED_WIN_EOL, helper.WIN_EOL)

			stdout.should.eql(expected)

			// TODO: separate this to a different test
			stdout = helper.unescapeVbsStreamOutput(stdout)
			
			JSON.parse(stdout).a.should.eql(helper.WIN_EOL)

			done()
		})
	})
})