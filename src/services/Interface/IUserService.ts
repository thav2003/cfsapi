import { Pagination } from '@utils/pagination';
import { UserCreateDTO, UserGetDTO } from '@dto/userDTO';
import { User } from '@models';
import { ObjectId } from 'mongodb';




/**
 * Interface for UserService
 */
export interface IUserService {
  // createConfession(data: RawConfessionCreateDTO): Promise<void>;
  getAllUsers(data: UserGetDTO): Promise<Pagination<User>>;
  getById(id:string | ObjectId):Promise<User>;
  updateById(id:string | ObjectId, data: Partial<User>):Promise<User>;
  removeById(id:string | ObjectId):Promise<User>;
  createUser(data:UserCreateDTO):Promise<User>;
}