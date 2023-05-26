import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import



if (!process.env['EAS_BUILD_PROFILE']) {
  // not a build process, use local env files
  console.log(`not a build process, use local env files`);
  const env = process.env.NODE_ENV || `development`;
  const env_path = `./env/${env}.env`;
  dotenv.config({ path: env_path });
  console.log(`app.config.ts:`, { env_path, env: process.env });
}

module.exports = (params) => {
  return {
    ...params.config,

    runtimeVersion: {
      "policy": "sdkVersion"
    },
    updates: {
      "url": "https://u.expo.dev/c1c96370-fe44-4da2-ae5d-65b5a1a6046c"
    },

    extra: {
      API_PORT: process.env.API_PORT,
      API_DOMAIN: process.env.API_DOMAIN,
      eas: {
        projectId: "c1c96370-fe44-4da2-ae5d-65b5a1a6046c"
      }
    }
  };
};