const path = require('path');
const TsConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const WebpackBar = require('webpackbar');
module.exports = {
	mode: 'development',

	resolve: {
		extensions: ['.ts', '.js'],
		plugins: [new TsConfigPathsPlugin /* { tsconfig, compiler } */()],
	},

	module: {
		rules: [
			{
				test: /\.tsx?$/,
				exclude: [path.resolve(__dirname, 'node_modules/mapbox-gl'), path.resolve(__dirname, 'node_modules')],
				use: {
					loader: 'ts-loader',
					options: {},
				},
			},
			{
				test: /\.html?$/,
				use: 'raw-loader',
			},
			{
				test: /\.svg$/,
				use: {
					loader: 'svg-url-loader',
					options: {
						limit: 10000000, // Convert images < 8kb to base64 strings
						name: 'images/[hash]-[name].[ext]',
					},
				},
			},
			{
				test: /\.css$/,
				use: [
					'style-loader', // creates style nodes from JS strings
					'css-loader', // translates CSS into CommonJS
				],
				include: [/node_modules/],
			},
			{
				test: /\.scss$/,
				use: [
					'to-string-loader',
					{
						loader: 'css-loader',
						options: {
							sourceMap: true,
						},
					},
					{
						loader: 'sass-loader',
						options: {
							sourceMap: true,

							sassOptions: {
								data: '@import "_styles";',
								includePaths: [path.join(__dirname, 'src/assets')],
							},
						},
					},
				],
			},
			{
				test: /\.(png|jp(e*)g)$/,
				use: [
					{
						loader: 'url-loader',
						options: {
							limit: 8000, // Convert images < 8kb to base64 strings
							name: 'images/[hash]-[name].[ext]',
						},
					},
				],
			},
			{
				test: /\.m?js$/,
				exclude: [
					path.resolve(__dirname, 'node_modules/mapbox-gl'),
					/node_modules/,
					path.resolve(__dirname, 'angular-calendar'),
				],
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env'],
					},
				},
			},
		],
	},

	/*externals: [
        function (context, request, callback) {
            if (/^@angular/.test(request)) {
                return callback(null, 'umd ' + request);
            }
            callback();
        }
	],*/

	externals: [/^bootstrap/, /^bootswatch/],
	plugins: [
		/* new WebpackSystemRegister({
             systemjsDeps: [
                 /^ngx-bootstrap/, // any import that starts with react
             ],
             registerName: 'test-module', // optional name that SystemJS will know this bundle as.
         }), */
		/*
        new UglifyJsPlugin({
            uglifyOptions:{
                output: {
                    comments: false,
                }
            }
		})  */
	],
};
