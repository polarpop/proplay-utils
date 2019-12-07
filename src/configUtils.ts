interface ConfigOptions {
  dev: {
    [key: string]: any
  },
  test: {
    [key: string]: any
  },
  production: {
    [key: string]: any
  }
}

export interface ConfigResponse {
  [key: string]: any
}

export function createFromEnv(
  prefix: string,
  delimeter: string = "_"
): object {
  const config: any = {};
  for (let [ key, value ] of Object.entries(process.env)) {
    let finder = new RegExp(`$${prefix}`, 'gi');
    if (finder.test(key)) {
      let configKey = key.replace(`${prefix}${delimeter}`, '');
      config[`${configKey}`] = value; 
    }
  }
  return config;
}

export function createExportedModule(
  config: ConfigOptions
): ConfigResponse {
  switch(process.env.NODE_ENV) {
    case 'production':
      return config.production;
    case 'dev':
      return config.dev;
    case 'test':
      return config.test;
    default:
      return config.dev;
  }
}