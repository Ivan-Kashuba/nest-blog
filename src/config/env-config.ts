export const envConfig = {
  MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017',
  PORT: process.env.PORT || 8080,
  DB_NAME: process.env.DB_NAME || 'local-db',
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY || '123456789',
  EMAIL_SENDER_PASSWORD: process.env.EMAIL_SENDER_PASSWORD || 'reIXhrS0ModiM4c',
};
