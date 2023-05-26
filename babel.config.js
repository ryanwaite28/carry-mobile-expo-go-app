module.exports = function(api) {
  api.cache(true);
  // console.log({ api });
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin'
    ]
  };
};
