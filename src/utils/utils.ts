import { ObjectId } from 'mongodb';
import * as fs from 'fs';
import * as utils from 'util';
import { InvalidError } from '../errors/app.errors';
import { Select } from '@core/repository/ISelect';

// Promisify some utility functions
export const exists = utils.promisify(fs.exists);
export const mkdir = utils.promisify(fs.mkdir);

export function isObjectId(id: string | ObjectId) {
  if (!ObjectId.isValid(id)) {
    return false;
  }
  return true;
}

export function getValidObjectId(id: string | ObjectId) {
  if (!ObjectId.isValid(id)) {
    throw new InvalidError('ObjectId không hợp lệ');
  }

  if (typeof id === 'string') {
    id = new ObjectId(id);
  }

  return id;
}

export function getValidDate(date: string | Date): Date {
  if (!date) {
    throw new InvalidError('Date must be provided');
  }

  let dateObject: Date;

  // Chuyển đổi chuỗi đại diện cho ngày thành đối tượng Date
  if (typeof date === 'string') {
    dateObject = new Date(date);
  } else if (date instanceof Date) {
    dateObject = date;
  } else {
    throw new InvalidError('Invalid date type');
  }

  // Kiểm tra tính hợp lệ của giá trị Date
  if (isNaN(dateObject.getTime())) {
    throw new InvalidError('Invalid date format');
  }

  return dateObject;
}

export function selectedFields(data:any[], select: Select, isOne: boolean) {
  let flag = -1;
  const ObjSelect = select ? select : {};
  const ObjSelectKeys = Object.keys(ObjSelect);
  if (ObjSelectKeys.length == 0) {
    if (isOne) {
      if (data.length > 0) {
        return data[0];
      } else {
        return null;
      }
    } else {
      return data;
    }
  }
  
  for (const key of ObjSelectKeys) {
    if (ObjSelect[key] == 1) {
      flag = 1;
      break;
    } else if (ObjSelect[key] == 0) {
      flag = 0;
    }
  }

  let res:any[];
  if (flag == 1) {
    res = data.map((item) => {
      const result = {};
      for (const [key, value] of Object.entries(select)) {
            
        if (value === 1 && item.hasOwnProperty(key)) {
          result[key] = item[key];
        }
      }
      return result;
    });
  } else if (flag == 0) {
    res = data.map((item) => {
      for (const [key, value] of Object.entries(select)) {
            
        if (value === 0 && item.hasOwnProperty(key)) {
          delete item[key];
        }
      }
      return item;
    });
  }
  if (isOne) {
    if (res.length > 0) {
      return res[0];
    } else {
      return null;
    }
  } else {
    return res;
  }
}