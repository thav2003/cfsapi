import { RawConfession } from '@models';
import { Filter, ObjectId } from 'mongodb';


export interface RawConfessionCreateDTO {
  content:string;
  sender:ObjectId;
}


export interface RawConfessionGetDTO {
  limit: number;
  pageNumber: number;
  filter: Filter<Partial<RawConfession>>;
  path: string;
}