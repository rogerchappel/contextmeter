// Configuration for the application
// Copyright (c) 2024 TestCorp - MIT License

export interface Config {
  port: number;
  host: string;
  database: DatabaseConfig;
  auth: AuthConfig;
  logging: LoggingConfig;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

export interface AuthConfig {
  secretKey: string;
  expiresIn: number;
  algorithm: string;
}

export interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  format: 'json' | 'text';
  outputs: string[];
}

/**
 * Default configuration for development
 * Override with environment variables in production
 */
export const defaultConfig: Config = {
  port: 3000,
  host: 'localhost',
  database: {
    host: 'localhost',
    port: 5432,
    username: 'developer',
    password: 'changeme',
    database: 'myapp_dev',
  },
  auth: {
    secretKey: 'dev-secret-key-not-for-production',
    expiresIn: 3600,
    algorithm: 'HS256',
  },
  logging: {
    level: 'debug',
    format: 'json',
    outputs: ['console'],
  },
};

export function loadConfig(): Config {
  const config: Partial<Config> = { ...defaultConfig };
  
  // Override with env vars
  if (process.env.PORT) {
    config.port = parseInt(process.env.PORT, 10);
  }
  if (process.env.HOST) {
    config.host = process.env.HOST;
  }
  if (process.env.LOG_LEVEL) {
    config.logging = { ...defaultConfig.logging, level: process.env.LOG_LEVEL as any };
  }
  
  return config as Config;
}
