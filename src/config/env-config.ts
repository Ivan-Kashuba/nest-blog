export enum EnvVariables {
  MONGO_URI = 'MONGO_URI',
  PORT = 'PORT',
  DB_NAME = 'DB_NAME',
  JWT_SECRET_KEY = 'JWT_SECRET_KEY',
  EMAIL_SENDER_PASSWORD = 'EMAIL_SENDER_PASSWORD',
  ADMIN_AUTH_HEADER = 'ADMIN_AUTH_HEADER',
}

export const envConfig: Record<EnvVariables, string> = {
  [EnvVariables.MONGO_URI]:
    process.env.MONGO_URI || 'mongodb://127.0.0.1:27017',
  [EnvVariables.PORT]: process.env.PORT || '8080',
  [EnvVariables.DB_NAME]: process.env.DB_NAME || 'local-db',
  [EnvVariables.JWT_SECRET_KEY]: process.env.JWT_SECRET_KEY || '123456789',
  [EnvVariables.EMAIL_SENDER_PASSWORD]: process.env.EMAIL_SENDER_PASSWORD || '',
  [EnvVariables.ADMIN_AUTH_HEADER]:
    process.env.ADMIN_AUTH_HEADER || 'Basic YWRtaW46cXdlcnR5',
};

export default () => ({
  ...envConfig,
});
