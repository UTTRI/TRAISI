let webpack = require('./webpack.config.test');
module.exports = function(config) {
	config.set({
		// base path that will be used to resolve all patterns (eg. files, exclude)
		basePath: './',
		plugins: ['karma-jasmine', 'karma-chrome-launcher', 'karma-webpack','karma-spec-reporter'],
		karmaTypescriptConfig: {
			tsconfig: './tsconfig.spec.json'
		},

		// frameworks to use
		// available frameworks: https://npmjs.org/browse/keyword/karma-adapter
		frameworks: ['jasmine'],
		mime: {
			'text/x-typescript': ['ts', 'tsx']
		},

		// list of files / patterns to load in the browser
		files: [
			'src/**/*.ts' // *.tsx for React Jsx
		],

        webpack: webpack,
        
        webpackMiddleware: {
            // webpack-dev-middleware configuration
            // i. e.
            stats: 'errors-only',
        },

		// list of files / patterns to exclude
		exclude: ['node_modules/*'],

		// preprocess matching files before serving them to the browser
		// available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
		preprocessors: {
			'src/**/*.ts': ['webpack'],
		},

		// test results reporter to use
		// possible values: 'dots', 'progress'
		// available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ["spec"],
        specReporter: {
          maxLogLines: 5,         // limit number of lines logged per test
          suppressErrorSummary: true,  // do not print error summary
          suppressFailed: false,  // do not print information about failed tests
          suppressPassed: false,  // do not print information about passed tests
          suppressSkipped: true,  // do not print information about skipped tests
          showSpecTiming: false // print the time elapsed for each spec
        },

		// web server port
		port: 9876,

		// enable / disable colors in the output (reporters and logs)
		colors: true,

		// level of logging
		// possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		logLevel: config.LOG_WARN,

		// enable / disable watching file and executing tests whenever any file changes
		autoWatch: true,

		// start these browsers
		// available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
		browsers: ['ChromeHeadless'],

		// Continuous Integration mode
		// if true, Karma captures browsers, runs the tests and exits
		singleRun: false,

		// Concurrency level
		// how many browser should be started simultaneous
		concurrency: Infinity
	});
};