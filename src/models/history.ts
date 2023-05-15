import { DocumentModel } from '@core/model/document';
import { ObjectId } from 'mongodb';

export interface HistoryModel<T extends DocumentModel> extends DocumentModel {
  collection: string,
  action: string;
  userId: ObjectId;
  data: T;
}