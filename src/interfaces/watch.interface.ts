import { IUser } from "./user.interface";
import { ICommonModel } from "./_common.interface";


export interface IWatch extends ICommonModel {
  owner_id: number,
  is_public: boolean,
  title: string,
  icon_link: string,
  icon_id: string,
  swlat: number,
  swlng: number,
  nelat: number,
  nelng: number,

  owner?: IUser,
  unseen_messages_count?: number,
  last_opened?: string,
  members_count?: number,
}

export interface IWatchMember extends ICommonModel {
  user_id: number,
  watch_id: number,
  uuid: string,

  user?: IUser,
}

export interface IWatchMemberRequest extends ICommonModel {
  user_id: number,
  watch_id: number,
  status: number, // null = pending, 1 = accepted, 0 = rejected
  uuid: string,

  user?: IUser,
}

export interface IWatchMessage extends ICommonModel {
  watch_id: number,
  parent_message_id: number,
  owner_id: number,
  body: string,
  uuid: string,

  owner?: IUser,
}