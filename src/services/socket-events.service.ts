import { io, Socket } from "socket.io-client";
import { Subscription, Subject, Observable, BehaviorSubject, filter, take } from 'rxjs';
import { IUser } from '../interfaces/user.interface';
import { ClientService } from './client.service';
import { UsersService } from './users.service';
import { PlainObject } from '../interfaces/json-object.interface';
import { UserStoreService } from "./user-store.service";
import { MODERN_APPS } from "../enums/all.enums";
import { COMMON_EVENT_TYPES } from "../enums/modern.enums";
import { AppConstants } from "./app.constants";
import { SafeStorageService } from "./storage.service";


export class SocketEventsService {
  private static you: IUser | any;
  private static socket?: Socket;

  private static connect_event: any;
  private static socket_id_event: any;
  private static user_event: any;
  private static disconnect_event: any;

  private static socket_id?: string;
  private static isListening = false;

  private static userStoreSubscription: Subscription;

  private static serviceIsReady = false;
  private static serviceIsReadyStream = new BehaviorSubject<boolean>(SocketEventsService.serviceIsReady);

  // event streams
  private static appEventStreamsMap: PlainObject<PlainObject<Subject<any>>> = {};
  private static registrationIsReadyStream = new Subject<void>();

  // user's conversations
  private static youConversationsSocketListeners: any = {};

  constructor() {}
  
  static init() {
    SocketEventsService.userStoreSubscription = UserStoreService.getChangesObs().subscribe((you: IUser | null) => {
      if (!SocketEventsService.you && you) {
        SocketEventsService.you = you;
        if (SocketEventsService.isListening === false) {
          SocketEventsService.isListening = true;
          console.log(`starting socket listener`);
          SocketEventsService.startListener();
        }
      }
      else if (SocketEventsService.you && !you) {
        SocketEventsService.you = you;
        if (SocketEventsService.isListening === true) {
          SocketEventsService.isListening = false;
          console.log(`stopping socket listener`);
          SocketEventsService.stopListener();
        }
      }
    });
  }

  static get isReady(): Observable<boolean> {
    return SocketEventsService.serviceIsReadyStream.asObservable().pipe(filter((state) => !!state), take(1));
  }

  static registerAppEventListenerStreams(app: MODERN_APPS, event_types_map: PlainObject) {
    if (!SocketEventsService.serviceIsReady) {
      console.warn(`Service not ready...`);
      return;
    }

    console.log(`registerAppEventListenerStreams:`, { app, event_types_map });

    if (!SocketEventsService.appEventStreamsMap[app]) {
      SocketEventsService.appEventStreamsMap[app] = {};
    }

    const event_types = Object.keys(event_types_map);

    for (const event_type of event_types) {
      const event_type_error = `${event_type}-error`;

      if (SocketEventsService.appEventStreamsMap[app][event_type]) {
        console.warn(`event stream ${event_type} already defined under app ${app}; ignoring...`);
        continue;
      }
      if (SocketEventsService.appEventStreamsMap[app][event_type_error]) {
        console.warn(`event stream ${event_type_error} already defined under app ${app}; ignoring...`);
        continue;
      }

      SocketEventsService.appEventStreamsMap[app][event_type] = new Subject<any>();
      SocketEventsService.appEventStreamsMap[app][event_type_error] = new Subject<any>();
  
      const listener = SocketEventsService.socket!.on(event_type, (event: any) => {
        console.log(`${event_type}`, { event });
        SocketEventsService.appEventStreamsMap[app][event_type].next(event);
      });

      const listenerError = SocketEventsService.socket!.on(`${event_type}-error`, (event: any) => {
        console.log(event_type_error, { event });
        SocketEventsService.appEventStreamsMap[app][event_type_error].next(event);
      });
    }
  }

  private static startListener() {
    const socket = io(ClientService.DOMAIN, { transports: ['websocket'] });
    SocketEventsService.socket = socket;

    const connect_event = SocketEventsService.socket!.on('connect', async () => {
      console.log(`===== socket connected. socket id: ${socket.id}`);
      SocketEventsService.socket_id = socket.id;
      if (SocketEventsService.you) {
        const jwt = await SafeStorageService.getData(AppConstants.JWT_NAME);
        console.log(`tracking user socket with jwt...`, { jwt: !!jwt });
        SocketEventsService.socket!.emit(`SOCKET_TRACK`, { jwt, user_id: SocketEventsService.you!.id });
      }
    });

    const disconnect_event = SocketEventsService.socket!.on('disconnect', (event: any) => {
      console.log(`===== socket disconnected`, event);
    });
    
    SocketEventsService.connect_event = connect_event;
    SocketEventsService.disconnect_event = disconnect_event;

    SocketEventsService.serviceIsReady = true;
    SocketEventsService.serviceIsReadyStream.next(SocketEventsService.serviceIsReady);
  }

  private static stopListener() {
    SocketEventsService.connect_event.disconnect();
    SocketEventsService.disconnect_event.disconnect();
    SocketEventsService.youConversationsSocketListeners = {};

    SocketEventsService.serviceIsReady = false;
    SocketEventsService.serviceIsReadyStream.next(SocketEventsService.serviceIsReady);
  }

  static emit(eventName: string, data: any) {
    SocketEventsService.socket!.emit(eventName, data);
  }

  static emitToRoom(params: {
    to_room: string,
    event_name: string,
    data: PlainObject,
  }) {
    SocketEventsService.socket!.emit(`EMIT_TO_ROOM`, params);
  }

  static emitToUser(params: {
    user_id: number,
    event_name: string,
    data: PlainObject,
  }) {
    if (params.user_id === SocketEventsService.you.id) {
      throw new Error(`Cannot emit event to self`);
    }

    SocketEventsService.socket!.emit(`EMIT_TO_USER`, params);
  }

  static joinRoom(room: string) {
    console.log(`socket id ${SocketEventsService.socket_id} joining room ${room}`, { room, socket_id: SocketEventsService.socket_id });
    SocketEventsService.socket!.emit(COMMON_EVENT_TYPES.SOCKET_JOIN_ROOM, { room });
  }

  static leaveRoom(room: string) {
    console.log(`socket id ${SocketEventsService.socket_id} leaving room ${room}`, { room, socket_id: SocketEventsService.socket_id });
    SocketEventsService.socket!.emit(COMMON_EVENT_TYPES.SOCKET_LEAVE_ROOM, { room });
  }

  static listenSocketCustom(event_type: string, call_back: (arg?: any) => any) {
    return SocketEventsService.socket!.on(event_type, call_back);
  }

  static listenToObservableEventStream<T = any>(app: MODERN_APPS, event_type: string) {
    const subjectStream = SocketEventsService.appEventStreamsMap[app][event_type];
    if (!subjectStream) {
      console.warn(`Unknown key for event stream: ${event_type}, creating new stream...`);
      SocketEventsService.appEventStreamsMap[app][event_type] = new Subject<any>();
      return SocketEventsService.appEventStreamsMap[app][event_type].asObservable() as Observable<T>;
    }
    const observable = (<Observable<T>> subjectStream.asObservable());
    return observable;
  }
}
