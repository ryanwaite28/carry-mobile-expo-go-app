import { IUser } from "./user.interface";
import { ICommonModel } from "./_common.interface";



export interface IMessaging extends ICommonModel {
  user_id: number,
  sender_id: number,
  uuid: string,

  sender?: IUser,
  user?: IUser,
  unread_messages_count?: number,
}

export interface IMessagingRequest extends ICommonModel {
  user_id: number,
  sender_id: number,
  status: number, // null = pending, 1 = accepted, 0 = rejected
  uuid: string,
}

export interface IMessage extends ICommonModel {
  from_id: number,
  to_id: number,
  body: string,
  lat: number,
  lng: number,
  opened: boolean,
  uuid: string,

  from?: IUser,
  to?: IUser,
}

export interface IMessagePhoto extends ICommonModel {
  message_id: number,
  photo_id: string,
  photo_link: string,
  uuid: string,
}

export interface IMessageVideo extends ICommonModel {
  message_id: number,
  s3object_bucket: string,
  s3object_key: string,
  uuid: string,
}

export interface IMessageAudio extends ICommonModel {
  message_id: number,
  s3object_bucket: string,
  s3object_key: string,
  uuid: string,
}