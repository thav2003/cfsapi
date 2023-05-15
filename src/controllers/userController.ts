import {  inject, injectable } from 'inversify';
import { CustomResponse, CustomRequest } from '@src/common/common';
import {  BadRequestError, MissingFieldError } from '@src/errors/app.errors';
import { UserCreateDTO, UserGetDTO  } from '@dto/userDTO';
import { TYPES } from '@src/types';
import { Filter } from 'mongodb';
import { User } from '@models';
import { IUserService } from '@services/Interface';
import { StaticStringKeys } from '@src/constants';
import isEmail from 'validator/lib/isEmail';
import isLength from 'validator/lib/isLength';

export enum UserRoles {
  ADMIN = 1,
  MODERATOR = 2,
  VISITOR = 3,
}

@injectable()
export class UserController  {
  private userService: IUserService;

  private limit: number;

  constructor(@inject(TYPES.UserService) userService: IUserService) {
    this.limit = 20;
    this.userService = userService;
  }

  public async find(req: CustomRequest, res: CustomResponse): Promise<void> {

    const limit = req.query.limit ? parseInt(req.query.limit as string) : this.limit;
    const pageNumber = req.query.page ? parseInt(req.query.page as string) : 1;
    const filter = req.query.filter ? JSON.parse(decodeURIComponent(req.query.filter as string)) as Filter<Partial<User>>  : {};
    // console.log(req.originalUrl);
    // console.log(req.baseUrl);
    // console.log(req.path);
    // const obj = { role: 'admin' };
    // const encodedObj = encodeURIComponent(JSON.stringify(obj));
    // const url = `https://example.com?data=${encodedObj}`;
    // {{URL}}/api/v1/users?page=1&limit=20&filter=%7B%22role%22%3A%22user%22%7D
    // console.log(url);
    // console.log(filter);
    const getUserDto: UserGetDTO = {
      pageNumber,
      limit,
      filter: filter,
      path: req.baseUrl,
    };

    const response = await this.userService.getAllUsers(getUserDto);
    res.sendData(200, 'Lấy data thành công', response);
  }

  public async get(req: CustomRequest, res: CustomResponse): Promise<void> {
    if (!req.params.id) {
      throw new MissingFieldError('id');
    }

    const user = await this.userService.getById(req.params.id);
    
    res.sendData(200, 'Lấy data thành công', user);
  }

  public async remove(req: CustomRequest, res: CustomResponse): Promise<void> {
    if (!req.body.id) {
      throw new MissingFieldError('id');
    }

    const deletedUser = await this.userService.removeById(req.body.id);

    res.sendData(204, 'Xoá user thành công', deletedUser);
  }

  public async create(req: CustomRequest, res: CustomResponse): Promise<void> {
    if (!req.body.name) {
      throw new MissingFieldError('name');
    }
    if (!req.body.email) {
      throw new MissingFieldError('email');
    }
    if (!req.body.password) {
      throw new MissingFieldError('password');
    }
    if (!req.body.role) {
      throw new MissingFieldError('role');
    }
    if (!isEmail(req.body.email)) {
      throw new BadRequestError(StaticStringKeys.INVALID_EMAIL);
    }
      
    if (!isLength(req.body.password.trim(), { min: 4, max: 20 })) {
      throw new BadRequestError(StaticStringKeys.INVALID_PASSWORD);
    }
    const userDTO:UserCreateDTO = {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      role: req.body.role,
    };

    const user = await this.userService.createUser(userDTO);
    res.sendData(201, 'Tạo user thành công', user);
  }
}