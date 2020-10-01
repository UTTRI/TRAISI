module.exports = function (api) {
	api.cache(true);

	const presets = [
		['@babel/preset-env'],
		[
			'@babel/preset-typescript',
			{
				exclude: ['node_modules/mapbox-gl/*'],
				targets: {
					browsers: [ "> 1%","last 2 versions", "IE 11", "not dead"]
				},
				modules: false
			},
			
		]
	];
	const plugins = [
		"babel-plugin-transform-typescript-metadata",
		[
			"@babel/plugin-proposal-decorators",
			{
				"legacy": true,
			}
		],
		'babel-plugin-replace-ts-export-assignment',
		"@babel/plugin-transform-block-scoping",
		["@babel/plugin-proposal-class-properties", { "loose": true }]
	];

	return {
		presets,
		plugins
	};
};
