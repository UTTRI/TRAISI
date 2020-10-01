const path = require('path');
const TsConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const WebpackBar = require('webpackbar');
module.exports = {
	entry: {
		general: path.join(process.cwd(), './src/general/viewer/traisi-questions-viewer.module.ts'),
		'general-builder': path.join(process.cwd(), './src/general/builder/traisi-questions-builder.module.ts'),
		map: path.join(process.cwd(), './src/map-question/traisi-map-question.module.ts'),
		sp: path.join(process.cwd(), './src/stated-preference/viewer/traisi-sp-question-viewer.module.ts'),
		'sp-builder': path.join(process.cwd(), './src/stated-preference/builder/traisi-sp-question-builder.module.ts'),
		'travel-diary': path.join(process.cwd(), './src/travel-diary/travel-diary-question.module.ts'),
		'route-select': path.join(process.cwd(), './src/route-select/route-select-question.module.ts')
	},

	output: {
		path: path.join(process.cwd(), 'dist'),
		filename: 'traisi-questions-[name].module.js',
		libraryTarget: 'amd'
	},
	mode: 'development',
	devtool: 'source-map',

	resolve: {
		extensions: ['.ts', '.js'],
		plugins: [new TsConfigPathsPlugin /* { tsconfig, compiler } */()]
	},

	module: {
		rules: [
			{
				test: /\.tsx?$/,
				exclude: [path.resolve(__dirname, 'node_modules/mapbox-gl'),path.resolve(__dirname,'node_modules')],
				use: {
					loader: 'babel-loader',
					options: {
					}
				}
			},
			{
				test: /\.html?$/,
				use: 'raw-loader'
			},
			{
				test: /\.svg$/,
				use: {
					loader: 'svg-url-loader',
					options: {
						limit: 10000000, // Convert images < 8kb to base64 strings
						name: 'images/[hash]-[name].[ext]'
					}
				}
			},
			{
				test: /\.css$/,
				use: [
					'style-loader', // creates style nodes from JS strings
					'css-loader' // translates CSS into CommonJS
				],
				include: [/node_modules/]
			},
			{
				test: /\.scss$/,
				use: [
					'to-string-loader',
					{
						loader: 'css-loader',
						options: {
							sourceMap: true
						}
					},
					{
						loader: 'sass-loader',
						options: {
							sourceMap: true,

							sassOptions: {
								data: '@import "_styles";',
								includePaths: [path.join(__dirname, 'src/assets')]
							}
						}
					}
				]
			},
			{
				test: /\.(png|jp(e*)g)$/,
				use: [
					{
						loader: 'url-loader',
						options: {
							limit: 8000, // Convert images < 8kb to base64 strings
							name: 'images/[hash]-[name].[ext]'
						}
					}
				]
			},
			{
				test: /\.m?js$/,
				exclude: [path.resolve(__dirname, 'node_modules/mapbox-gl'), /node_modules/,path.resolve(__dirname, 'angular-calendar')],
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env']
					}
				}
			}
		]
	},

	/*externals: [
        function (context, request, callback) {
            if (/^@angular/.test(request)) {
                return callback(null, 'umd ' + request);
            }
            callback();
        }
    ],*/
	externals: [
		/^@angular\/platform-browser\/animations/,
		/^@angular\/animations/,
		/^@angular\/common/,
		/^@angular\/core/,
		/^@angular\/upgrade/,
		/^@angular\/forms/,
		/^@angular\/router/,
		/^@angular\/platform-browser/,
		/^ngx-bootstrap/,
		/^@fortawesome/,
		/^bootstrap/,
		/^bootswatch/,
		/^angular-calendar/,
		/^rxjs/,
		/^traisi-question-sdk/
	],
	plugins: [
		new WebpackBar()
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
	]
};
