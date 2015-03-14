var should = require('should')
var index = require('../index')

describe('list', function () {
	this.timeout(5000)
	
	it('Streaming interface', function (done) {
		var testKey = 'hkcu\\software'

		// use non streaming interface to get expected results
		index.list(testKey, function (err, expectedResults) {

			var actualResults = {}

			index.list(testKey)
			.once('error', done)
			.on('data', function(d) {
				console.log(131232)
				actualResults[d.key] = d.data				
			}).once('finish', function () {
				actualResults.should.eql(expectedResults)
				done()
			})
		})		
	})

	it('works for multiple keys', function (done) {
		var actualResults = {}
		var keys = ['hklm', 'hkcu']

		// use non streaming interface to get expected results
		index.list(keys, function (err, expectedResults) {
			index.list(keys)
			.once('error', done)
			.on('data', function(d) {
				actualResults[d.key] = d.data				
			}).once('finish', function () {
				actualResults.should.eql(expectedResults)
				done()
			})
		})		
	})
})