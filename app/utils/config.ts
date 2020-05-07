export enum Channels {
  ASSET_IS_READY = 'ASSET_IS_READY',
  SHOW_MSG = 'SHOW_MSG',
  SYNC_AUTH_TOKEN = 'SYNC_AUTH_TOKEN',
  SYNC_LOGIN_DIALOG = 'SYNC_LOGIN_DIALOG',
  OPEN_ASSET = 'OPEN_ASSET',
  REMOVE_ASSET = 'REMOVE_ASSET',
  SYNC_LOADING = 'SYNC_LOADING'
}

export const config: {
  [key: string]: {
    graphqlUri: string;
    apiBaseUrl: string;
  };
} = {
  development: {
    graphqlUri: 'https://iisy.cloud/v2/bff/graphql',
    apiBaseUrl: 'https://iisy.cloud',
  },
  production: {
    graphqlUri: 'https://iisy.cloud/v2/bff/graphql',
    apiBaseUrl: 'https://iisy.cloud'
  }
};

export const envConfig = config[process.env.NODE_ENV!];
