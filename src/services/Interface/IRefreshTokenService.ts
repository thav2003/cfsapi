import { RefreshToken } from '@models';





export interface IRefreshTokenService {
  getRefreshToken(token:string):Promise<RefreshToken>;
  removeRefreshToken(token:RefreshToken):Promise<void>;
}