// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

/** @type {import('expo/metro-config').MetroConfig} */
// eslint-disable-next-line no-undef
const config = getDefaultConfig(__dirname);

// Add resolver configuration to help with module resolution
config.resolver = {
  ...config.resolver,
  unstable_enableSymlinks: false,
  unstable_enablePackageExports: false,
};

module.exports = withNativeWind(config, { input: './global.css' });
