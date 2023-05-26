import { AlertTypes } from '../enums/all.enums';

export interface IAlert {
  timestamp: number, // Date.now()
  type: AlertTypes,
  message: string,
  autoClose: boolean,
}
