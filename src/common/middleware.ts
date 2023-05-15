import { NextFunction } from 'express';
import { CustomRequest, CustomResponse } from './common';

export type ValidationFunction = (values: { [key: string]: any }) => { [key: string]: any };

export type CheckFields = (
  type: 'body' | 'query' | 'cookies' | 'params',
  fields: string[],
  message:string,
  validation?:ValidationFunction,
)=>(req: CustomRequest, _res: CustomResponse, next: NextFunction)=>void;

export type CheckJwt = (req: CustomRequest, res: CustomResponse, next: NextFunction) => Promise<void>;

export type CheckRole = (roles: string[] ) => (_req: CustomRequest, res: CustomResponse, next: NextFunction) => void;

export type CheckVersion = (req: CustomRequest, res: CustomResponse, next: NextFunction) => void;