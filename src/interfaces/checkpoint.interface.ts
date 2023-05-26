import { IUser } from "./user.interface";
import { ICommonModel } from "./_common.interface";

export interface ICheckpoint extends ICommonModel {
  user_id: number,
  check_id: number,
  date_check_responded: string,
  date_expires: string,
  uuid: string,

  check_user?: IUser,
  user?: IUser,
}