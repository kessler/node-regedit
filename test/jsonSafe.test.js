var cp = require('child_process')
var should = require('should')
var path = require('path')
var helper = require('../lib/helper.js')
var format = require('util').format
var vbsScript = path.resolve(__dirname, '..', 'vbs', 'JsonSafeTest.wsf')

describe.skip('json safe stream version', function() {
	it('also escapes windows newline', function(done) {
		cp.execFile('cscript', ['/NoLogo', vbsScript], function(err, stdout, stderr) {
			if (err) {
				return done(err)
			}

			JSON.parse(stdout).a.should.eql('"' + helper.ESCAPED_WIN_EOL + '测试\\')

			done()
		})
	})
})
