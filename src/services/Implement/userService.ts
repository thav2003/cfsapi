import { injectable, inject } from 'inversify';
import paginate, { Pagination } from '@utils/pagination';
import { UserCreateDTO, UserGetDTO } from '@dto/userDTO';
import { TYPES } from '@src/types';
import { User } from '@models';
import { Select } from '@core/repository/ISelect';
import { IUserService } from '@services/Interface';
import { IRepository } from '@core/repository/IRepository';
import { ObjectId } from 'mongodb';
import { getValidObjectId } from '@utils/utils';
import * as bcrypt from 'bcrypt';
import logger from '@src/logger';
import { IErrorFactory } from '@src/errors/error.factory';



/**
 * The actual class that contains all the business logic related to users.
 * Controller sanitize/validate(basic) and sends data to this class methods.
 */
@injectable()
export class UserService implements IUserService {
  private userRepositoryProxy: IRepository<User>;

  private defaultSelectUser:Select;
  // @inject(TYPES.IRepositoryProxy) private userRepository: IRepositoryProxy<User>;

  private errorFactory:IErrorFactory;

  constructor(@inject(TYPES.UserRepositoryProxy) userRepositoryProxy: IRepository<User>,
    @inject(TYPES.ErrorFactory) errorFactory: IErrorFactory,
  ) {
    this.userRepositoryProxy = userRepositoryProxy;
    this.defaultSelectUser = {
      password:0,
      passwordConfirm:0,
    };
    this.errorFactory = errorFactory;
    logger.debug('User service initialized');

  }

  public async createUser(data: UserCreateDTO): Promise<User> {
    const duplicated = await this.userRepositoryProxy.findOne({ email:data.email }, this.defaultSelectUser);
    if (duplicated) {
      this.errorFactory.createDuplicateError('Email đã tồn tại');
    }
    const hashPassword = await this.hashPassword(data.password);
    const user = {
      name: data.name,
      email: data.email,
      password: hashPassword,
      role: data.role,
      status:0,
      active:false,
    } as User;
    const res = await this.userRepositoryProxy.create(user);
    return res;
  }

  public async removeById(id: string | ObjectId): Promise<User> {
    const user = await this.userRepositoryProxy.get(getValidObjectId(id));
    if (!user) {
      this.errorFactory.createNotFoundError('Xoá user không thành công');
    }
    const res = await this.userRepositoryProxy.removeById(user._id);
    return res;
  }

  public async getById(id: string | ObjectId): Promise<User> {
    const user = this.userRepositoryProxy.get(getValidObjectId(id), this.defaultSelectUser);
    if (!user) {
      this.errorFactory.createNotFoundError('Không tìm được user');
    }
    return user;
  }

  public async updateById(id:string | ObjectId, data: Partial<User>):Promise<User> {
    const objKey = getValidObjectId(id);
    const user = await this.userRepositoryProxy.get(objKey);
    if (!user) {
      this.errorFactory.createNotFoundError('Không tìm được user');
    }
    const res = await this.userRepositoryProxy.updateById(objKey, data);
    return res; 
  }

  public async getAllUsers(getUserDto: UserGetDTO): Promise<Pagination<User>> {
    let documents: User[];
    const filter = getUserDto.filter || {};
    documents = await this.userRepositoryProxy.find(filter, getUserDto.limit, getUserDto.pageNumber, this.defaultSelectUser);
    const totalRecord = await this.userRepositoryProxy.countAll(filter);
    return paginate(documents, getUserDto.limit, getUserDto.pageNumber, totalRecord, getUserDto.path);
  }

  private async hashPassword(password: string): Promise<string> {
    const normalizePassword = password.trim();
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(normalizePassword, salt);
    return hash;
  }
 

}