import { DocumentModel } from '@core/model/document';
import { ObjectId } from 'mongodb';



export interface RawConfession extends DocumentModel {
  content:string;
  sender:ObjectId ;
  status: 'pending' | 'approved' | 'rejected';
}