
import { DocumentModel } from '@core/model/document';


export interface User extends DocumentModel {
  name: string;
  email: string;
  password: string;
  role: string;
  age: number;
  gender: 'male' | 'female';
  location: {
    long: number;
    lat: number;
  };
  interests: string[];
  lastSeen: Date;
  status:number;
  active:boolean;
  facebookId:string;
}

