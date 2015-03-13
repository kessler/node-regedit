var should = require('should')
var index = require('../index')

describe('streaming regedit', function () {
	this.timeout(5000)
	
	it('lists', function (done) {
		var testKey = 'hkcu\\software'

		index.list(testKey, function (err, expectedResults) {

			var actualResults = {}

			index.list(testKey)
			.on('error', done)
			.on('data', function(d) {
				actualResults[d.key] = d.data				
			}).on('finish', function () {
				actualResults.should.eql(expectedResults)
				done()
			})
		})		
	})
})