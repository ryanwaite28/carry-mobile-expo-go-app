
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { MODERN_APPS } from '../enums/all.enums';
import { PlainObject } from '../interfaces/json-object.interface';
import { IUser } from '../interfaces/user.interface';
import { SocketEventsService } from './socket-events.service';
import { UsersService } from './users.service';

/**
 * Get and tracks user's unseen information (global state/store), AppSocketEventsStateService includes:
 * - messages
 * - conversations
 * - notifications
 */

export interface IUnseen {
  messages: number;
  conversations: number;
  notifications: number;
}


export class AppSocketEventsStateService {
  private static you: IUser | any;

  private static unseenEventsByApp: PlainObject<PlainObject<number>> = {};

  private static tagByAppEvent: PlainObject<PlainObject<string>> = {};
  private static appEventsByTag: PlainObject<PlainObject<PlainObject<boolean>>> = {};

  private static changesByApp: PlainObject<BehaviorSubject<PlainObject<number>>> = {}; 
  private static changesByAppEvent: PlainObject<PlainObject<BehaviorSubject<number>>> = {};
  private static changesByAppEventTag: PlainObject<PlainObject<BehaviorSubject<PlainObject<number>>>> = {};

  // private changesFreezeByApp: PlainObject<boolean> = {}; 
  private static changesFreezeByAppEvent: PlainObject<PlainObject<boolean>> = {}; 


  static registerEvents(app: MODERN_APPS, eventsList: Array<string>) {
    console.log(`registering events for:`, { app, eventsList });
    if (!AppSocketEventsStateService.unseenEventsByApp[app]) {
      AppSocketEventsStateService.unseenEventsByApp[app] = {};
      AppSocketEventsStateService.tagByAppEvent[app] = {};

      AppSocketEventsStateService.changesByApp[app] = new BehaviorSubject<any>({});
      AppSocketEventsStateService.changesByAppEvent[app] = {};

      // AppSocketEventsStateService.changesFreezeByApp[app] = false;
      AppSocketEventsStateService.changesFreezeByAppEvent[app] = {};
    }

    eventsList.forEach((event_type) => {
      AppSocketEventsStateService.unseenEventsByApp[app][event_type] = 0;
      AppSocketEventsStateService.changesByAppEvent[app][event_type] = new BehaviorSubject<number>(AppSocketEventsStateService.unseenEventsByApp[app][event_type]);
      AppSocketEventsStateService.changesFreezeByAppEvent[app][event_type] = false;

      SocketEventsService.listenToObservableEventStream(app, event_type).subscribe((event: any) => {
        console.log(event);
        // AppSocketEventsStateService.eventsByApp[app].next(event);
        AppSocketEventsStateService.increment(app, event_type, 1);
      });
    });
  }

  static assignTagToAppEvents(app: MODERN_APPS, assignments: Array<{ event: string, tag: string }>) {
    console.log(`assignTagToAppEvents:`, { app, assignments });
    if (!AppSocketEventsStateService.tagByAppEvent[app]) {
      AppSocketEventsStateService.tagByAppEvent[app] = {};
    }
    for (const assignment of assignments) {
      AppSocketEventsStateService.tagByAppEvent[app][assignment.event] = assignment.tag;
      if (!AppSocketEventsStateService.appEventsByTag[app]) {
        AppSocketEventsStateService.appEventsByTag[app] = {};
      }
      if (!AppSocketEventsStateService.appEventsByTag[app][assignment.tag]) {
        AppSocketEventsStateService.appEventsByTag[app][assignment.tag] = {};
      }
      AppSocketEventsStateService.appEventsByTag[app][assignment.tag][assignment.event] = true;

      if (!AppSocketEventsStateService.changesByAppEventTag[app]) {
        AppSocketEventsStateService.changesByAppEventTag[app] = {};
      }
      if (!AppSocketEventsStateService.changesByAppEventTag[app][assignment.tag]) {
        const initialState = {
          [assignment.event]: !AppSocketEventsStateService.unseenEventsByApp[app] ? 0 : AppSocketEventsStateService.unseenEventsByApp[app][assignment.event] || 0,
        };
        AppSocketEventsStateService.changesByAppEventTag[app][assignment.tag] = new BehaviorSubject(initialState);
      }
    }
  }

  static increment(app: MODERN_APPS, event_type: string, amount: number) {
    AppSocketEventsStateService.setIncrementDecrementInternal(app, event_type, amount, true);
  }
  
  static decrement(app: MODERN_APPS, event_type: string, amount: number) {
    AppSocketEventsStateService.setIncrementDecrementInternal(app, event_type, amount, false);
  }

  private static setIncrementDecrementInternal(app: MODERN_APPS, event_type: string, amount: number, increase: boolean) {
    if (!event_type || !amount || !AppSocketEventsStateService.unseenEventsByApp[app].hasOwnProperty(event_type) || amount <= 0) {
      console.log(`could not increment:`, { app, event_type, amount });
      return;
    }

    // const appCanChange = AppSocketEventsStateService.appCanChange(app);
    const appEventCanChange = AppSocketEventsStateService.appEventCanChange(app, event_type);
    // const canChange = (appEventCanChange && appCanChange);

    if (appEventCanChange) {
      console.log(`AppSocketEventsStateService - setIncrementDecrementInternal:`, { app, event_type, amount, increase });
      const newAmount = increase
        ? AppSocketEventsStateService.unseenEventsByApp[app][event_type] + amount
        : AppSocketEventsStateService.unseenEventsByApp[app][event_type] - amount;
      AppSocketEventsStateService.unseenEventsByApp[app][event_type] = newAmount;
      AppSocketEventsStateService.changesByApp[app].next({ ...AppSocketEventsStateService.unseenEventsByApp[app] });
      AppSocketEventsStateService.changesByAppEvent[app][event_type].next(AppSocketEventsStateService.unseenEventsByApp[app][event_type]);

      // get tag
      const tag: string = AppSocketEventsStateService.tagByAppEvent[app] && AppSocketEventsStateService.tagByAppEvent[app][event_type] || '';
      if (tag) {
        const state = AppSocketEventsStateService.getAppEventsStateByTag(app, tag);
        const tagStream = AppSocketEventsStateService.changesByAppEventTag[app][tag];
        tagStream.next(state);
      }
    }
  }

  static clear (app: MODERN_APPS, event_type?: string) {
    if (event_type && AppSocketEventsStateService.unseenEventsByApp[app].hasOwnProperty(event_type)) {
      AppSocketEventsStateService.unseenEventsByApp[app][event_type] = 0;
      AppSocketEventsStateService.changesByApp[app].next({ ...AppSocketEventsStateService.unseenEventsByApp[app] });
      AppSocketEventsStateService.changesByAppEvent[app][event_type].next(AppSocketEventsStateService.unseenEventsByApp[app][event_type]);

    } 
    else {
      Object.keys(AppSocketEventsStateService.unseenEventsByApp[app]).forEach((event_type) => {
        AppSocketEventsStateService.unseenEventsByApp[app][event_type] = 0;
        AppSocketEventsStateService.changesByAppEvent[app][event_type].next(AppSocketEventsStateService.unseenEventsByApp[app][event_type]);
      });
      AppSocketEventsStateService.changesByApp[app].next({ ...AppSocketEventsStateService.unseenEventsByApp[app] });
    }

    const tag: string = AppSocketEventsStateService.tagByAppEvent[app] && AppSocketEventsStateService.tagByAppEvent[app][(event_type || '')] || '';
    if (tag) {
      const state = AppSocketEventsStateService.getAppEventsStateByTag(app, tag);
      const tagStream = AppSocketEventsStateService.changesByAppEventTag[app][tag];
      tagStream.next(state);
    }
  }
  
  
  static getAppEventsStateByTag(app: MODERN_APPS, tag: string) {
    if (!AppSocketEventsStateService.appEventsByTag[app] || !AppSocketEventsStateService.appEventsByTag[app][tag]) {
      const msg = `app or tags not assigned/registered:`;
      console.warn(msg, AppSocketEventsStateService, { app, tag });
      throw new Error(msg);
    }
    const stateByTag: PlainObject<number> = {};
    let total = 0;
    const event_types = Object.keys(AppSocketEventsStateService.appEventsByTag[app][tag]);
    for (const event_type of event_types) {
      const state = AppSocketEventsStateService.unseenEventsByApp[app][event_type] || 0;
      stateByTag[event_type] = state;
      total = total + state;
    }
    stateByTag['total'] = total;
    return stateByTag;
  }

  // appCanChange(app: MODERN_APPS) {
  //   return !AppSocketEventsStateService.changesFreezeByApp[app];
  // }

  static appEventCanChange(app: MODERN_APPS, event_type: string) {
    return !AppSocketEventsStateService.changesFreezeByAppEvent[app][event_type];
  }

  // setAppChangeFreeze(app: MODERN_APPS, state: boolean) {
  //   AppSocketEventsStateService.changesFreezeByApp[app] = state;
  // }

  static setAppEventChangeFreeze(app: MODERN_APPS, event_type: string, state: boolean) {
    console.log(`AppSocketEventsStateService.setAppEventChangeFreeze:`, { app, event_type, state });
    AppSocketEventsStateService.changesFreezeByAppEvent[app][event_type] = state;
  }

  static getAppStateChanges(app: MODERN_APPS) {
    return AppSocketEventsStateService.changesByApp[app].asObservable();
  }

  static getAppEventStateChanges(app: MODERN_APPS, event_type: string) {
    return AppSocketEventsStateService.changesByAppEvent[app][event_type].asObservable();
  }

  static getAppEventTagChanges(app: MODERN_APPS, tag: string) {
    return AppSocketEventsStateService.changesByAppEventTag[app][tag].asObservable();
  }
}
