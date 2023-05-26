import { IUser } from '../interfaces/user.interface';
import { BehaviorSubject, Observable } from 'rxjs';



export class UserStoreService {
  private static you?: IUser | null;
  private static changes: BehaviorSubject<IUser | null> = new BehaviorSubject<IUser | null>(<any> undefined);
  
  static is_subscription_active = false;
  static is_subscription_active_stream = new BehaviorSubject<boolean>(UserStoreService.is_subscription_active);

  constructor() { }

  static getChangesObs(): Observable<IUser | null> {
    return UserStoreService.changes.asObservable();
  }

  static getLatestState(): IUser | null {
    return UserStoreService.you ? { ...UserStoreService.you } : null;
  }

  static setState(newState: IUser | null) {
    UserStoreService.you = newState ? (<IUser> { ...newState }) : null;
    const newEvent = UserStoreService.you ? { ...UserStoreService.you } : null;
    UserStoreService.changes.next(<IUser | null> newEvent);
  }

  static mergeState(newChanges: Partial<IUser>, emitEvent: boolean = true) {
    const newState = UserStoreService.you ? { ...UserStoreService.you } : {};
    Object.assign(newState, { ...newChanges });
    UserStoreService.you = <IUser> newState;
    if (emitEvent) {
      UserStoreService.changes.next({ ...UserStoreService.you });
    }
  }
}
