const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const TsConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const WebpackBar = require('webpackbar');
const ngw = require('@ngtools/webpack');
module.exports = [
	{
		entry: {
			general: path.join(process.cwd(), './src/general/viewer/traisi-questions-viewer.module.ts'),
			'general-builder': path.join(process.cwd(), './src/general/builder/traisi-questions-builder.module.ts'),
			map: path.join(process.cwd(), './src/map-question/traisi-map-question.module.ts'),
			sp: path.join(process.cwd(), './src/stated-preference/viewer/traisi-sp-question-viewer.module.ts'),
			'sp-builder': path.join(process.cwd(), './src/stated-preference/builder/traisi-sp-question-builder.module.ts'),
			'travel-diary': path.join(process.cwd(), './src/travel-diary/travel-diary-question.module.ts'),
			'travel-diary-scheduler': path.join(process.cwd(), './src/travel-diary-scheduler/travel-diary-scheduler-question.module.ts'),
			'route-select': path.join(process.cwd(), './src/route-select/route-select-question.module.ts'),
		},
	
		stats: 'detailed',

		output: {
			path: path.join(__dirname, 'dist'),
			filename: 'traisi-questions-[name].module.js',
			libraryTarget: 'amd',
		},
		mode: 'production',
		devtool: false,
		resolve: {
			extensions: ['.ts', '.js'],
			plugins: [new TsConfigPathsPlugin /* { tsconfig, compiler } */()],
		},

		module: {
			rules: [
				{
					test: /(?:\.ngfactory\.js|\.ngstyle\.js|\.ts)$/,
					loader: '@ngtools/webpack',
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
					test: /\.css$/i,
					use: ['to-string-loader', 'css-loader'],
				},
				{
					test: /\.scss$/,
					use: [
						'style-loader',
						'css-loader',
						{
							loader: 'sass-loader',
							options: {
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
				/*{
				test: /\.m?js$/,
				exclude: [path.resolve(__dirname, 'node_modules/mapbox-gl'), /node_modules/],
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env']
					}
				}
			}*/
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
		externals: [
			/^@angular/,
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
			/^traisi-question-sdk/,
		],
		plugins: [
			new WebpackBar(),
			new ngw.AngularCompilerPlugin({
				mainPath: 'src/travel-diary/travel-diary-question.module.ts',
				tsConfigPath: path.join(__dirname, 'tsconfig.aot.json'),
				skipCodeGeneration: true,
				platform: 0,
			}),
		],
	},
	{
		entry: {
			general: path.join(process.cwd(), './src/general/viewer/traisi-questions-viewer.module.ts'),
			'general-builder': path.join(process.cwd(), './src/general/builder/traisi-questions-builder.module.ts'),
			map: path.join(process.cwd(), './src/map-question/traisi-map-question.module.ts'),
			/*sp: path.join(process.cwd(), './src/stated-preference/viewer/traisi-sp-question-viewer.module.ts'),
			'sp-builder': path.join(
				process.cwd(),
				'./src/stated-preference/builder/traisi-sp-question-builder.module.ts'
			), */
			'travel-diary': path.join(process.cwd(), './src/travel-diary/travel-diary-question.module.ts'),
			'route-select': path.join(process.cwd(), './src/route-select/route-select-question.module.ts'),
		},
		stats: 'detailed',

		output: {
			path: path.join(__dirname, 'dist'),
			filename: 'traisi-questions-[name].es5.module.js',
			libraryTarget: 'amd',
		},
		mode: 'production',
		devtool: false,
		resolve: {
			extensions: ['.ts', '.js'],
			plugins: [new TsConfigPathsPlugin /* { tsconfig, compiler } */()],
		},

		module: {
			rules: [
				{
					test: /(?:\.ngfactory\.js|\.ngstyle\.js|\.ts)$/,
					loader: '@ngtools/webpack',
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
					test: /\.css$/i,
					use: ['to-string-loader', 'css-loader'],
				},
				{
					test: /\.scss$/,
					use: [
						'style-loader',
						'css-loader',
						{
							loader: 'sass-loader',
							options: {
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
				/*{
				test: /\.m?js$/,
				exclude: [path.resolve(__dirname, 'node_modules/mapbox-gl'), /node_modules/],
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env']
					}
				}
			}*/
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
		externals: [
			/^@angular/,
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
			/^traisi-question-sdk/,
		],
		plugins: [
			new WebpackBar(),
			new ngw.AngularCompilerPlugin({
				mainPath: 'src/travel-diary/travel-diary-question.module.ts',
				tsConfigPath: path.join(__dirname, 'tsconfig.aot-es5.json'),
				skipCodeGeneration: true,
				platform: 0,
			}),
		],
	},
];
