module.exports = function ( grunt ) {

	'use strict';

	grunt.registerTask( 'revision', 'Set revision to grunt config pkg.version', function () {
		var done = this.async();

		grunt.config( 'commitHash', "doesntworkonwin" )
		done();
	});

};
