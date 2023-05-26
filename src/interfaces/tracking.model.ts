import { IUser } from "./user.interface";
import { ICommonModel } from "./_common.interface";


export interface ITracking extends ICommonModel {
  user_id: number,
  tracking_id: number,
  uuid: string,

  user?: IUser,
  track_user?: IUser,
}

export interface ITrackingRequest extends ICommonModel {
  user_id: number,
  tracking_id: number,
  status: number, // null = pending, 1 = accepted, 0 = rejected
  uuid: string,

  user?: IUser,
  tracking?: IUser,
}