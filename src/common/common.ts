import { User } from '@models';
import {  Response as ExpressResponse, Request as ExpressRequest } from 'express';
import { JwtPayload } from 'jsonwebtoken';

export interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
  errors?: any[];
}


export interface CustomRequest extends ExpressRequest {
  token: string | JwtPayload;
}
  
export interface CustomResponse extends ExpressResponse {
  token:string | JwtPayload;
  locals:{
    user:User
  };
  sendData(code:number, message:string, data?:any):any
  sendError(code:number, message:string, errors?:any[]):any
}
