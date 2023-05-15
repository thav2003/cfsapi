import { RegistrationDTO, GetUserLoginDTO } from '@dto/authDTO';
import { RefreshToken, User } from '@models';
import { NormalizedUser } from '@utils/normalize';
import { ObjectId } from 'mongodb';

export type RegistrationStrategy = 'email';

export enum Register {
  FACEBOOK = 'facebook',
  EMAIL = 'email',
}
export enum Login {
  FACEBOOK = 'facebook',
  EMAIL = 'email',
}
export interface RegisterStrategy {
  register(data: RegistrationDTO): Promise<User>;
}
export interface LoginStrategy {
  login(data: GetUserLoginDTO): Promise<NormalizedUser>;
}

export interface IAuthService {
  verifyUserId(id:ObjectId):Promise<void>;
  signToken(id:ObjectId):string;
  createRefreshToken(user:NormalizedUser): Promise<string>;
  verifyExpiration(refreshToken:string):Promise<RefreshToken>;
  registerUser(strategy: string, data:RegistrationDTO): Promise<User>;
  loginUser(strategy: string, data:GetUserLoginDTO): Promise<NormalizedUser>;
}