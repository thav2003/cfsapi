// import 'source-map-support/register';
// import 'reflect-metadata';
import express = require('express');
import * as compress from 'compression';
import dataHandler from '@middleware/dataHandler';
import apiVersionMiddleware from '@middleware/checkVersion';
import db from '@src/database';
import errorHandler from '@src/errors/error.handler';
import container from '@src/injector';
import logger from '@src/logger';
import { IRedisClient } from '@src/redisClient';
import routes from '@src/routes';
import { TYPES } from '@src/types';
import cookieParser = require('cookie-parser');
import cors = require('cors');

const app = express();
/**
 * This is a init function
 */
async function init() {
  // Attach HTTP request info logger middleware in test mode
  if (process.env.NODE_ENV === 'development') {
    app.use((req: express.Request, _res, next) => {
      logger.debug(`[${req.method}] ${req.hostname}${req.url}`);

      next();
    });
  }

  app.disable('x-powered-by'); // Hide information
  app.use(compress()); // Compress

  // Enable middleware/whatever only in Production
  if (process.env.NODE_ENV === 'production') {
    // For example: Enable sentry in production
    // app.use(Sentry.Handlers.requestHandler());
  }

  /**
  * Configure cookies
  */
  app.use(cookieParser());

  /**
   * Configure cors
   */
  app.use(cors());
  

  
  /**
   * Configure mongoose
   **/
  if (! await db.isDbConnected()) {
    await db.connect();
  }

  /**
   * Configure redis
   **/
  const redisClient = container.get<IRedisClient>(TYPES.Redis);
  await redisClient.connect();

  /**
   * Configure body parser
   */
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true }));


  /**
   * Host static public directory
   */
  app.use('/', express.static('public'));

  /**
   * Configure version middleware
   */
  app.use(apiVersionMiddleware);

  /**
   * Configure data handler
   */
  app.use(dataHandler);

  /**
   * Configure routes
   */
  routes(app);

  /**
   * Configure error handler
   */
  errorHandler(app);
}


// Handle shutdown
const shutDown = async () => {
  const redisClient = container.get<IRedisClient>(TYPES.Redis);
  await redisClient.disconnect();
  await db.disconnect();
  logger.server('Server is dead !!!');
  process.exit(1);
};

//Export app need for integration testing
export { app, shutDown, init  };
