import { MongoClientOptions } from 'mongodb';

const TWO_MINUTES_IN_MS = 2 * 60 * 1000;
const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

const DB_USER = '';
const DB_PWD = '';

const DB_HOST = 'localhost:27017';
const DB_NAME = 'fptu';

const MONGODB_OPTIONS:MongoClientOptions = {
  minPoolSize:10,
  maxPoolSize: 50,
  connectTimeoutMS: TWO_MINUTES_IN_MS,
  socketTimeoutMS: ONE_DAY_IN_MS,   
};
const DBConfig = {
  USER : DB_USER,
  PWD:DB_PWD,
  HOST:DB_HOST,
  DB_NAME:DB_NAME,
  OPTIONS:MONGODB_OPTIONS,
};
export default DBConfig;