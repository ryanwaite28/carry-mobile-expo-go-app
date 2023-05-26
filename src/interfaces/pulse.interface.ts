import { IUser } from "./user.interface";
import { ICommonModel } from "./_common.interface";


export interface IPulse extends ICommonModel {
  owner_id: number,
  code: string,
  lat: number,
  lng: number,
  sent_in_error: boolean,
  uuid: string,

  owner?: IUser,
  location?: string,
}

export interface IPulseLocationWatch extends ICommonModel {
  owner_id: number,
  lat: number,
  lng: number,
  radius: number,
  uuid: string,

  owner?: IUser,
  messages: IPulseMessage[];
}

export interface IPulseMessage extends ICommonModel {
  owner_id: number,
  pulse_id: number,
  body: string,
  opened: boolean,
  uuid: string,

  owner?: IUser,
}

export interface IPhotoPulse extends ICommonModel {
  owner_id: number,
  code: string,
  photo_link: string,
  photo_id: string,
  lat: number,
  lng: number,
  uuid: string,

  owner?: IUser,
  messages: IPhotoPulseMessage[];
}

export interface IPhotoPulseMessage extends ICommonModel {
  owner_id: number,
  pulse_id: number,
  body: string,
  opened: boolean,
  uuid: string,

  owner?: IUser,
}

export interface IAudioPulse extends ICommonModel {
  owner_id: number,
  code: string,
  s3object_bucket: string,
  s3object_key: string,
  lat: number,
  lng: number,
  uuid: string,

  owner?: IUser,
}

export interface IVideoPulse extends ICommonModel {
  owner_id: number,
  code: string,
  s3object_bucket: string,
  s3object_key: string,
  lat: number,
  lng: number,
  uuid: string,

  owner?: IUser,
}
