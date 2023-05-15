import 'source-map-support/register';
import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();// load env vào project trước khi chạy
import { app, init, shutDown } from 'config';
import logger from './logger';
const PORT = process.env.PORT || 3000;

// handle shutdown
process.on('SIGINT', shutDown);
process.on('SIGTERM', shutDown);

// start server
init()
  .then(() => {
    app.listen(process.env.PORT || 3000, () => {
      logger.server(`Running Node.js version ${process.version}`);
      logger.server(`App environment: ${process.env.NODE_ENV}`);
      logger.server(`App is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    logger.error('Unknown error. ' + error.message);
  });



