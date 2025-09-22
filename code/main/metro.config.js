const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

module.exports = (() => {
  const baseConfig = getDefaultConfig(__dirname);
  const { transformer, resolver } = baseConfig;
  const config = {
    ...baseConfig,
    transformer: {
      ...transformer,
      babelTransformerPath: require.resolve('react-native-svg-transformer'),
    },
    resolver: {
      ...resolver,
      assetExts: resolver.assetExts.filter(ext => ext !== 'svg'),
      sourceExts: [...resolver.sourceExts, 'svg'],
    },
  };
  return withNativeWind(config, { input: './app/globals.css' });
})();