import express = require('express');
import {  Response as ExpressResponse, Request as ExpressRequest, NextFunction  } from 'express';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import logger from './logger';

export interface CustomRequest extends ExpressRequest {
  userId?: string;
}

const options:Options = {
  target: 'http://localhost:3334', // target host
  changeOrigin: true, // needed for virtual hosted sites
  ws: true, // proxy websockets
  pathRewrite: (path: string, req: CustomRequest) => {
    if (path === '/api/v1/user/me') {
      // const userId = req.header('userId');
      const userId = req.userId; 
      if (userId) {
        console.log(path);
        return `/api/v1/users/${userId}`;
      }
    }
    return path;
  },
  router: {
    // when request.headers.host == 'dev.localhost:3000',
    // override target 'http://www.example.org' to 'http://localhost:8000'
    'dev.localhost:3000': 'http://localhost:3334',
  },
  logProvider:(_provider)=>{
    return logger;
  },
};

// create the proxy (without context)
const exampleProxy = createProxyMiddleware(options);


// mount `exampleProxy` in web server
const app = express();

// Middleware để lấy giá trị của id từ header
function getUserId(req: CustomRequest, _res: ExpressResponse, next: NextFunction) {
  const userId = req.header('userId'); // lấy giá trị của userId từ header
  // const userId = '643cf80a6e59fd2a108b7a82';
  if (userId) {
    req.userId = userId;
  }
  next(); // chuyển tiếp đến middleware tiếp theo
}
// Khai báo middleware trước khi sử dụng proxy
app.use('/api', getUserId);


app.use('/api', exampleProxy);
app.listen(3000);