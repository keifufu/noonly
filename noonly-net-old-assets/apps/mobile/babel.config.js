// react-native-reanimated/plugin plugin has to be listed last
module.exports = {
	presets: ['module:metro-react-native-babel-preset'],
	plugins: [
		[
			'module-resolver',
			{
				root: ['./src'],
				extensions: ['.ios.js', '.android.js', '.js', '.ts', '.jsx', '.tsx', '.json'],
				alias: {
					'@components': './src/components',
					'@utils': './src/utils'
				}
			}
		],
		[
			'@babel/plugin-proposal-decorators',
			{
				legacy: true
			}
		],
		'react-native-paper/babel',
		'react-native-reanimated/plugin'
	]
}