const webpack = require('webpack');
const AssetsPlugin = require('assets-webpack-plugin');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');
const path = require('path');
const fs = require('fs');
const postcssImport = require('postcss-import');
const postcssPresetEnv = require('postcss-preset-env');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebookincubator/create-react-app/issues/637
const appDirectory = fs.realpathSync(process.cwd());

function resolveApp(relativePath) {
	return path.resolve(appDirectory, relativePath);
}

const paths = {
	appSrc: resolveApp('src'),
	appBuild: resolveApp('theme/dist'),
	appIndexJs: resolveApp('src/index.js'),
};

const DEV = process.env.NODE_ENV === 'development';

module.exports = {
	mode: process.env.NODE_ENV,
	bail: !DEV,
	// We generate sourcemaps in production. This is slow but gives good results.
	// You can exclude the *.map files from the build during deployment.
	target: 'web',
	devtool: DEV ? 'cheap-module-source-map' : 'source-map',
	entry: [paths.appIndexJs],
	output: {
		path: paths.appBuild,
		filename: DEV ? 'bundle.js' : 'bundle.[hash:8].js',
	},
	module: {
		rules: [
			// Disable require.ensure as it's not a standard language feature.
			{ parser: { requireEnsure: false } },
			{
				test: /\.m?js$/,
				exclude: /(node_modules|bower_components)/,
				include: paths.appSrc,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env']
					}
				}
			},
			{
				test: /\.(sa|sc|c)ss$/,
				use: [
					MiniCssExtractPlugin.loader,
					{
						loader: 'css-loader',
						options: {
							sourceMap: true
						}
					},
                    {
                        loader: 'postcss-loader',
	                    options: {
							sourceMap: true,
		                    plugins: (loader) => [
			                    postcssImport({ root: loader.resourcePath }),
			                    postcssPresetEnv(),
			                    autoprefixer(), // will read browserslist from package.json
			                    !DEV && cssnano()
		                    ].filter(Boolean)
	                    }
                    },
					{
						loader: 'sass-loader',
						options: {
							sourceMap: true
						}
					},
				],
			},
		],
	},
	plugins: [
		new CleanWebpackPlugin([ paths.appBuild ], { root: resolveApp('.') }),
		new MiniCssExtractPlugin({
			filename: DEV ? '[name].css' : 'name.[hash:8].css',
			chunkFilename: DEV ? '[id].css' : '[id].[hash:8].css',
		}),
		new webpack.EnvironmentPlugin({
			NODE_ENV: 'development', // use 'development' unless process.env.NODE_ENV is defined
			DEBUG: false,
		}),
		new AssetsPlugin({
			path: paths.appBuild,
			filename: 'assets.json',
		}),
		// new BundleAnalyzerPlugin(),
		// !DEV &&
		//   new webpack.optimize.UglifyJsPlugin({
		//     compress: {
		//       screw_ie8: true, // React doesn't support IE8
		//       warnings: false,
		//     },
		//     mangle: {
		//       screw_ie8: true,
		//     },
		//     output: {
		//       comments: false,
		//       screw_ie8: true,
		//     },
		//     sourceMap: true,
		//   }),
		DEV &&
		new FriendlyErrorsPlugin({
			clearConsole: false,
		}),
		DEV &&
		new BrowserSyncPlugin({
			notify: false,
			host: 'localhost',
			port: 4000,
			logLevel: 'silent',
			files: ['./*.php'],
			proxy: 'http://localhost:9009/',
			open: false,
		}),
	].filter(Boolean),
};
