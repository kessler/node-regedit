var should = require('should')
var index = require('../index')

describe('list', function () {
	this.timeout(5000)
	
	it('Streaming interface', function (done) {
		var testKey = 'hkcu\\software'

		// use non streaming interface to get expected results
		index.list(testKey, function (err, expectedResults) {

			var actualResults = {}
			var error
			index.list(testKey)
			.once('error', function(e) {
				should(e).be.an.Error
				error = e
			})
			.on('data', function(d) {
				actualResults[d.key] = d.data				
			}).once('finish', function () {
				actualResults.should.eql(expectedResults)
				done(error)
			})
		})		
	})

	it('works for multiple keys', function (done) {
		var actualResults = {}
		var keys = ['hklm', 'hkcu']
		var error

		// use non streaming interface to get expected results
		index.list(keys, function (err, expectedResults) {
			index.list(keys)
			.once('error', function(e) {
				error = e
			})
			.on('data', function(d) {
				actualResults[d.key] = d.data				
			}).once('finish', function () {
				actualResults.should.eql(expectedResults)
				done(error)
			})
		})		
	})

	describe.only('benchmark test', function (done) {
		var testSize = 10000
		var staticBaseKey = 'HKCU\\software\\ironSource\\test\\bench\\'

		var baseKey, keys

		it('test', function (done) {

			index.list(baseKey, function (err, result) {
				if (err) return done(err)
				console.log(result)
				done()
			})
		})

		beforeEach(function (done) {
			
			baseKey = staticBaseKey + Date.now()

			// clear remains of previous tests
			index.deleteKey(staticBaseKey, function (err) {
				if (err) {
					console.log(err)
					console.log('this might be ok.')
				}

				// create N keys for the test
				keys = []

				for (var i = 0; i < testSize; i++) {
					keys.push(baseKey + '\\' + i)
				}

				index.createKey(keys, function(err, result) {
					if (err) return done(err)

					done()
				})
			})			
		})
	})
})