import { DocumentModel } from '@core/model/document';
import {  injectable } from 'inversify';
import { IRepository } from './IRepository';
import { ObjectId, Filter, Collection } from 'mongodb';
import { Select } from './ISelect';
import { Sort } from './ISort';
import { IRedisClient } from '@src/redisClient';
import { TYPES } from '@src/types';
import { getValidObjectId, selectedFields } from '@utils/utils';
import container from '@src/injector';


@injectable()
export default class RepositoryProxy<T extends DocumentModel> implements IRepository<T> {

  private repository: IRepository<T>;

  private cachePrefix: string;

  private cacheTTL:number;

  private redisClient: IRedisClient;

  constructor(repository: IRepository<T>) {

    this.repository = repository;
    this.cachePrefix = 'cache ' + repository.getCollectionName() + ':';
    this.cacheTTL = 1 * 24 * 60 * 60;
    this.redisClient = container.get<IRedisClient>(TYPES.Redis);
    // (async () => {
    //   await this.initialize();
    // })();
    this.getCollection().watch([], { fullDocument: 'updateLookup' }).on('change', (change) => {
      const { operationType, fullDocument, documentKey } = change as any;
      // Cập nhật dữ liệu tương ứng trong Redis
      if (operationType === 'insert' || operationType === 'update') {
        this.redisClient.set(this.getCacheKey('id', fullDocument._id), fullDocument, this.cacheTTL);
      } else if (operationType === 'delete') {
        this.redisClient.get(this.getCacheKey('id', documentKey._id)).then(res=>{
          this.redisClient.removeElementFromList(this.getCacheKey('list'), res);
        }).then(()=>{
          this.redisClient.remove(this.getCacheKey('id', documentKey._id));
        });
      }
    });

  }


  public async getAll(): Promise<T[]> {
    const cacheKey = this.getCacheKey('list');
    const cachedResult = await this.redisClient.getList(cacheKey);
    if (cachedResult.length > 0) {
      return cachedResult as T[];
    }
    const entities = await this.repository.getAll();
    await Promise.all(entities.map((entity) => this.redisClient.set(this.getCacheKey('id', entity._id), entity, this.cacheTTL)));
    await this.redisClient.set(cacheKey, entities, this.cacheTTL);
    return entities;
  }

  public async get(id: ObjectId, select?: Select): Promise<T | null> {
    const cacheKey = this.getCacheKey('id', id);
    const cachedResult = await this.redisClient.get(cacheKey);
    if (cachedResult) {
      return selectedFields([cachedResult], select, true) as T | null;
    }
    const doc = await this.repository.get(getValidObjectId(id));
    if (doc) {
      await Promise.all([
        this.redisClient.set(cacheKey, doc, this.cacheTTL),
        this.redisClient.addToListAsync(this.getCacheKey('list'), doc),
      ]);
    }
    return selectedFields([doc], select, true) as T | null;
  }

  public async find(filter: Filter<Partial<T>>, limit: number, page?: number, select?: Select, sort?: Sort): Promise<T[]> {
    const cacheKey = this.getCacheKey('list');
    const cachedResult = await this.redisClient.getList(cacheKey) as T[];

    let list = cachedResult.filter(cache=>{
      return Object.keys(filter).every((key)=>cache[key] === filter[key]);
    });

    if (sort) {
      list.sort((a, b) => {
        for (const key in sort) {
          const order = sort[key];
          if (a[key] < b[key]) {
            return order === 1 ? -1 : 1;
          } else if (a[key] > b[key]) {
            return order === 1 ? 1 : -1;
          }
        }
        return 0;
      });
    }

    if (page && page > 0) {
      const skip = limit * (page - 1);
      list = list.slice(skip, skip + limit);
    } else {
      list = list.slice(0, limit);
    }

    list = list.slice(0, limit);

    return selectedFields(list, select, false) as T[];
  }

  public async findOne(filter: Filter<Partial<T>>, select?: Select): Promise<T | null> {
    const cacheKey = this.getCacheKey('list');
    const cachedResult = await this.redisClient.getList(cacheKey) as T[];


   
    const find = cachedResult.filter(cache=>{
      return Object.keys(filter).every((key)=>cache[key] === filter[key]);
    });
    if (find.length > 0) {
      return selectedFields(find, select, true) as T | null;
    }

    const entity = await this.repository.findOne(filter);
    if (entity) {
      await Promise.all([
        this.redisClient.set(this.getCacheKey('id', entity._id), entity, this.cacheTTL),
        this.redisClient.addToListAsync(cacheKey, entity),
      ]);
      return selectedFields([entity], select, true) as T | null;
    }
    return null;
  }

  public async create(data: Partial<T>): Promise<T> {
    const newEntity = await this.repository.create(data);
    await Promise.all([
      this.redisClient.set(this.getCacheKey('id', newEntity._id), newEntity, this.cacheTTL),
      this.redisClient.addToListAsync(this.getCacheKey('list'), newEntity),
    ]);
    return newEntity;
  }

  public async createMany(data: T[]): Promise<T[]> {
    const newEntities = await this.repository.createMany(data);
    await Promise.all(newEntities.map((entity) => {
      this.redisClient.set(this.getCacheKey('id', entity._id), entity, this.cacheTTL);
      this.redisClient.addToListAsync(this.getCacheKey('list'), entity);
    }));
    return newEntities;
  }

  public async update(filter: Filter<T>, data: Partial<T>, multi: boolean): Promise<T[]> {
    const updatedEntities = await this.repository.update(filter, data, multi);
    const cacheKeyList = this.getCacheKey('list');
    const updatePromises = updatedEntities.map(async entity =>{
      const cachedResultId = await this.redisClient.get(this.getCacheKey('id', entity._id)) as T; 
      await Promise.all([
        // this.redisClient.remove(this.getCacheKey('id', entity._id)),
        this.redisClient.set(this.getCacheKey('id', entity._id), entity, this.cacheTTL),
        this.redisClient.removeElementFromList(cacheKeyList, cachedResultId),
        this.redisClient.addToListAsync(cacheKeyList, entity),
      ]);
    });
    await Promise.all(updatePromises);
    return updatedEntities;
  }

  public async updateById(id: ObjectId, data: Partial<T>): Promise<T> {
    const updatedEntity = await this.repository.updateById(id, data);
    const cacheKeyList = this.getCacheKey('list');
    const cacheKeyId = this.getCacheKey('id', updatedEntity._id);

    const cachedResultId = await this.redisClient.get(cacheKeyId) as T;

    await Promise.all([
      // this.redisClient.remove(cacheKeyId),
      this.redisClient.set(cacheKeyId, updatedEntity, this.cacheTTL),
      this.redisClient.removeElementFromList(cacheKeyList, cachedResultId),
      this.redisClient.addToListAsync(cacheKeyList, updatedEntity),
    ]);
    return updatedEntity;
  }

  public async remove(filter: Filter<T>, multi: boolean): Promise<T[]> {
    const deletedEntities = await this.repository.remove(filter, multi);
    const cacheKeyList = this.getCacheKey('list');
    const deletePromises = deletedEntities.map(async entity =>{
      const cachedResultId = await this.redisClient.get(this.getCacheKey('id', entity._id)) as T; 
      await Promise.all([
        this.redisClient.remove(this.getCacheKey('id', entity._id)),
        this.redisClient.removeElementFromList(cacheKeyList, cachedResultId),
      ]);
    });
    await Promise.all(deletePromises);
    return deletedEntities;
  }

  public async removeById(id: ObjectId): Promise<T> {
    const deletedEntity = await this.repository.removeById(id);
    const cacheKeyList = this.getCacheKey('list');
    const cacheKeyId = this.getCacheKey('id', deletedEntity._id);
    const cachedResultId = await this.redisClient.get(cacheKeyId) as T;
    
    await Promise.all([
      this.redisClient.remove(cacheKeyId),
      this.redisClient.removeElementFromList(cacheKeyList, cachedResultId),
    ]);
    return deletedEntity;
  }

  public async countAll(filter: Filter<Partial<T>>): Promise<number> {
    const cacheKey = this.getCacheKey('list');
    const cachedResult = await this.redisClient.getList(cacheKey) as T[];
    const filtered = cachedResult.filter(cache=>{
      return Object.keys(filter).every((key)=>cache[key] === filter[key]);
    });
    return filtered.length;
  }

  getCollection(): Collection {
    return this.repository.getCollection();
  }

  getCollectionName(): string {
    return this.repository.getCollectionName();
  }

  private getCacheKey(methodName: string, ...args: any[]): string {
    const argsString = args.map((arg) => JSON.stringify(arg)).join(':');
    return `${this.cachePrefix}${methodName}:${argsString}`;
  }

  public async initialize(): Promise<void> {
    const cacheKey = this.getCacheKey('list');
    const listKeyExists = await this.redisClient.getList(cacheKey);
    if (listKeyExists.length === 0) {
      // const entities = await this.repository.getAll();
      // await Promise.all([
      //   entities.map(async (entity) => {
      //     this.redisClient.set(this.getCacheKey('id', entity._id), entity, this.cacheTTL);
      //   }),
      //   await this.redisClient.remove(cacheKey),
      //   await this.redisClient.addToListAsync(cacheKey, entities),
      // ]);
      await this.redisClient.remove(cacheKey);
      await this.redisClient.addToListAsync(cacheKey, []);
      return;
    }
    // logger.info(cacheKey + ' have exist !!');
  }
}