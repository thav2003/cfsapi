import { injectable, inject } from 'inversify';
import { Collection, Filter, ObjectId, UpdateResult, DeleteResult, InsertOneResult } from 'mongodb';
import db from '@src/database';
import { getValidObjectId } from '@utils/utils';
import { IRepository } from './IRepository';
import { Select } from './ISelect';
import { Sort } from './ISort';
import { DocumentModel } from '@core/model/document';
import { IErrorFactory } from '@src/errors/error.factory';
import { TYPES } from '@src/types';



/**
 * This Repository class is the base repository. It is an abstract class because it can only be
 * extended. This class is writen to support mongoose properly which means it will look different
 * if you use mongodb driver directly or use any other orm or database driver.
 *
 * The collection property is the mongoose collection in this case. For you, it can be mongodb collection for example.
 */
@injectable()
export default class Repository<T extends DocumentModel> implements IRepository<T> {

  private readonly collection: Collection;

  private readonly collectionName:string;

  private readonly errorFactory : IErrorFactory;

  constructor(@inject('collectionName') collection: string,
    @inject(TYPES.ErrorFactory) errorFactory: IErrorFactory,
  ) {
    this.collection = db.getCollection(collection);
    this.collectionName = collection;
    this.errorFactory = errorFactory;
  }


  
  public async countAll(filter: Filter<Partial<T>> = {}):Promise<number> {
    const collection = this.collection;
    const query = collection.countDocuments(filter);
    return query;
  }

  public async getAll(): Promise<T[]> {
    const collection = this.collection;
    const query = collection.find<T>({});
    const docs = await query.toArray();

    return docs as T[] | null;
  }

  public async get(id: ObjectId, select: Select = {}): Promise<T | null> {
    const objectId = getValidObjectId(id);

    const collection = this.collection;

    const doc = await collection.findOne<T>({ _id: objectId },  { projection:select });

    return doc as T | null;
  }

  public async findOne(filter: Filter<Partial<T>> = {}, select?: Select): Promise<T | null> {
    const collection = this.collection;
    const doc = await collection.findOne<T>(filter, { projection:select });
    return doc as T | null;
  }

  public async find(filter: Filter<Partial<T>> = {}, limit: number = 10, page: number = 0, select?: Select, sort?: Sort): Promise<T[]> {
    const collection = this.collection;
    const query = collection.find<T>(filter, { projection:select });

    if (sort) {
      query.sort(sort);
    }

    if (page > 0) {
      const skip = limit * (page - 1);
      query.skip(skip);
    }
    query.limit(limit);

    const docs = await query.toArray();

    return docs as T[] | null;
  }
 
  public async create(data: Partial<T>): Promise<T> {
    if (!data) {
      this.errorFactory.createMongoDbError('Không có dữ liệu');
    }
    const date = new Date();
    data.createdAt = date;
    data.updatedAt = date;
    data.isDeleted = false;
    const collection = this.collection;
    // const doc = (await collection.insertOne(data)).ops[0] as T;
    const res:InsertOneResult = (await collection.insertOne(data));
    const doc = await this.get(res.insertedId);
    return doc;
  }

  public async createMany(datas: Partial<T[]>): Promise<T[]> {
    if (!datas || !Array.isArray(datas) || datas.length === 0) {
      this.errorFactory.createMongoDbError('Không có dữ liệu');
    }
    const date = new Date();
    const modifiedDatas = datas.map(data => ({
      ...data,
      createdAt: date,
      updatedAt: date,
      isDeleted: false,
    }));
    const collection = this.collection;
    const result = await collection.insertMany(modifiedDatas);
    const insertedIds = result.insertedIds;
    const insertedDocs = [];
    for (const id of Object.values(insertedIds)) {
      const doc = await collection.findOne({ _id: id });
      if (doc) {
        insertedDocs.push(doc);
      }
    }
    return insertedDocs as T[];
  }

  public async update(filter: Filter<T>, data: Partial<T>, multi: boolean): Promise<T[]> {
    const collection = this.collection;
    let result:UpdateResult;
  
    const date = new Date();
    data.updatedAt = date;
    if (multi) {
      result = await collection.updateMany(filter, { $set: data });
    } else {
      result = await collection.updateOne(filter, { $set: data });
    }
  
    if (result.modifiedCount === 0) {
      this.errorFactory.createMongoDbError('Không có dữ liệu nào được cập nhật');
    }

    const docs = await collection.find(filter).toArray() as T[];
    return docs;
  }

  public async updateById(id: ObjectId, data: Partial<T>):Promise<T> {

    const collection = this.collection;

    const date = new Date();
    data.updatedAt = date;
    let result:UpdateResult = await collection.updateOne({ _id: id }, { $set: data });

    if (result.modifiedCount === 0) {
      this.errorFactory.createMongoDbError('Không có dữ liệu nào được cập nhật');
    }
    const doc = await this.get(id);
    return doc;

  }

  public async remove(filter: Filter<T>, multi: boolean): Promise<T[]> {
    const collection = this.collection;
    const docs = await collection.find(filter).toArray() as T[];
    if (docs.length === 0) {
      this.errorFactory.createMongoDbError('Dữ liệu không tồn tại');
    }
    let result:DeleteResult;
    if (multi) {
      result = await collection.deleteMany(filter);
    } else {
      result = await collection.deleteOne(filter);
    }
    if (result.deletedCount === 0) {
      this.errorFactory.createMongoDbError('Không có dữ liệu nào được xoá');
    }
    return docs;
  }

  public async removeById(id: ObjectId): Promise<T> {

    const collection = this.collection;
    const doc = await collection.findOne({ _id: id }) as T;
    if (!doc) {
      this.errorFactory.createMongoDbError('Dữ liệu không tồn tại');
    }
    let result:DeleteResult = await collection.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      this.errorFactory.createMongoDbError('Không có dữ liệu nào được xoá');
    }
    return doc;
  }

  public getCollection(): Collection {
    return this.collection;
  }

  public getCollectionName(): string {
    return this.collectionName;
  }
}