
const DB_PORT = 6379;
const DB_HOST = '127.0.0.1';
const ROOTNODES = [
  {
    url: 'redis://127.0.0.1:8000',
  },
  {
    url: 'redis://127.0.0.1:8001',
  },
  {
    url: 'redis://127.0.0.1:8002',
  },
] ;
const DOQ = true;

const RedisConfig = {
  DB_PORT:DB_PORT,
  DB_HOST:DB_HOST,
  DOQ:DOQ,
  ROOTNODES:ROOTNODES,
};

export default RedisConfig;