import { IUser } from './user.interface';

export interface IUserField {
  id: number;
  user_id: number;
  fieldname: string;
  fieldtype: string;
  fieldvalue: string;
  uuid: string;
  createdAt: string;
  updatedAt: string;
  //
  user?: IUser;
}
