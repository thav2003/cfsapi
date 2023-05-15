import { ApiResponse, CustomRequest, CustomResponse } from '@src/common/common';
import { NextFunction } from 'express';


export default function dataHandler(_req:CustomRequest, res:CustomResponse, next:NextFunction) {  
  res.sendData = function (code, message, data) {
    const response:ApiResponse = {
      success:true,
      message:message,
      data:data,
    };
    res.status(code).json(response);
  };

  res.sendError = function (code, message, errors = []) {
    const response:ApiResponse = {
      success:false,
      message:message,
      errors:errors,
    };
    res.status(code).json(response);
  };
  next();
}