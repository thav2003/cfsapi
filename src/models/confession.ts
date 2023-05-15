import { DocumentModel } from '@core/model/document';
import { ObjectId } from 'mongodb';



export interface Confession extends DocumentModel {
  content:string;
  sender:ObjectId;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: ObjectId;
  facebookId?:string;
  deletedBy?: ObjectId;
  // getPendingConfessions(): Promise<Confession[]>;
  // getApprovedConfessions(): Promise<Confession[]>;
}