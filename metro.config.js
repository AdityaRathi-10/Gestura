const { getDefaultConfig } = require('expo/metro-config');
const {
	wrapWithReanimatedMetroConfig,
} = require('react-native-reanimated/metro-config');


const defaultConfig = getDefaultConfig(__dirname);

defaultConfig.resolver.assetExts.push('pte')
defaultConfig.resolver.assetExts.push('bin')

module.exports = wrapWithReanimatedMetroConfig(defaultConfig);