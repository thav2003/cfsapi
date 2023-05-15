import { DocumentModel } from './../model/document';
import { Collection, Filter, ObjectId } from 'mongodb';
import { Select } from './ISelect';
import { Sort } from './ISort';




/**
 * Base repository interface.
 */


export interface IRepository<T extends DocumentModel> {
  getAll():Promise<T[]>;
  get(id: ObjectId, select?: Select): Promise<T | null>;
  find(filter: Filter<Partial<T>>, limit: number, page?: number, select?: Select, sort?: Sort): Promise<T[]>;
  findOne(filter: Filter<Partial<T>>, select?: Select):Promise<T | null>;
  create(data: Partial<T>): Promise<T>;
  createMany(data: Partial<T[]>): Promise<T[]>;
  update(filter: Filter<T>, data: Partial<T>, multi: boolean): Promise<T[]>;
  updateById(id: ObjectId, data: Partial<T>): Promise<T>;
  remove(filter: Filter<T>, multi: boolean): Promise<T[]>;
  removeById(id: ObjectId): Promise<T>;
  getCollection(): Collection;
  countAll(filter: Filter<Partial<T>>): Promise<number>;
  getCollectionName():string;
  
}