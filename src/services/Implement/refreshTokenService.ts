import { IRepository } from '@core/repository/IRepository';
import { RefreshToken } from '@models';
import { IRefreshTokenService } from '@services/Interface';
import { InvalidTokenError } from '@src/errors/app.errors';
import { TYPES } from '@src/types';
import { inject, injectable } from 'inversify';



@injectable()
export class RefreshTokenService implements IRefreshTokenService {
  private refreshTokenRepositoryProxy:IRepository<RefreshToken>;

  constructor(@inject(TYPES.RefreshTokenRepositoryProxy) refreshTokenRepositoryProxy: IRepository<RefreshToken>) {
    this.refreshTokenRepositoryProxy = refreshTokenRepositoryProxy;
  }

  async removeRefreshToken(token: RefreshToken): Promise<void> {
    await this.refreshTokenRepositoryProxy.removeById(token._id);
  }
    
  async getRefreshToken(token: string): Promise<RefreshToken> {
    const checkRefreshToken = await this.refreshTokenRepositoryProxy.findOne({ token:token });
    if (!checkRefreshToken) {
      throw new InvalidTokenError('REFRESH');
    }
    return checkRefreshToken;
  }


}