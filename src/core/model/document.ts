import { ObjectId } from 'mongodb';



export interface DocumentModel {
  _id:ObjectId;
  isDeleted:boolean;
  deletedAt:Date;
  createdAt:Date;
  updatedAt:Date;
}