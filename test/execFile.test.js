/* eslint-disable max-len, no-unused-expressions */

var should = require('should')
var execFile = require('../lib/execFile.js')
var path = require('path')
var fs = require('fs')

var testScript = path.join(__dirname, 'lib', 'testscript.js')

describe('execFile', function() {

	it('removes all the listeners from stdout/stderr to avoid buffering output, but enjoys all the good cleanup code node.js has to offer', function(done) {

		var child = execFile()('node', [testScript], function(err, stdout, stderr) {
			err.should.be.an.Error
			stdout.should.eql('')
			stderr.should.eql('')
			done()
		})
	})

	it('does not buffer stdout', function(done) {

		var opts = {
			bufferStderr: true,
		}

		var child = execFile(opts)('node', [testScript], function(err, stdout, stderr) {
			err.should.be.an.Error
			stdout.should.eql('')
			stderr.should.containEql('throw new Error(\'error\')')
			done()
		})
	})

	it('does not buffer stderr', function(done) {

		var opts = {
			bufferStdout: true,
		}

		var child = execFile(opts)('node', [testScript], function(err, stdout, stderr) {
			err.should.be.an.Error
			stdout.should.eql('123\n')
			stderr.should.eql('')
			done()
		})
	})

	it('buffers everything', function(done) {

		var opts = {
			bufferStdout: true,
			bufferStderr: true,
		}

		var child = execFile(opts)('node', [testScript], function(err, stdout, stderr) {
			err.should.be.an.Error
			stdout.should.eql('123\n')
			stderr.should.containEql('throw new Error(\'error\')')
			done()
		})
	})
})
