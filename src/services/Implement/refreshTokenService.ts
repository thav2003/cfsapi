import { IRepository } from '@core/repository/IRepository';
import { RefreshToken } from '@models';
import { IRefreshTokenService } from '@services/Interface';
import { IErrorFactory } from '@src/errors/error.factory';
import { TYPES } from '@src/types';
import { inject, injectable } from 'inversify';



@injectable()
export class RefreshTokenService implements IRefreshTokenService {
  private refreshTokenRepositoryProxy:IRepository<RefreshToken>;

  private errorFactory:IErrorFactory;


  constructor(@inject(TYPES.RefreshTokenRepositoryProxy) refreshTokenRepositoryProxy: IRepository<RefreshToken>,
    @inject(TYPES.ErrorFactory) errorFactory: IErrorFactory,
  ) {
    this.refreshTokenRepositoryProxy = refreshTokenRepositoryProxy;
    this.errorFactory = errorFactory;
  }

  async removeRefreshToken(token: RefreshToken): Promise<void> {
    await this.refreshTokenRepositoryProxy.removeById(token._id);
  }
    
  async getRefreshToken(token: string): Promise<RefreshToken> {
    const checkRefreshToken = await this.refreshTokenRepositoryProxy.findOne({ token:token });
    if (!checkRefreshToken) {
      this.errorFactory.createNotFoundError('Refresh token không tồn tại');
    }
    return checkRefreshToken;
  }


}