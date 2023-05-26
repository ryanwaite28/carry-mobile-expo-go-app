import { Subject } from "rxjs";


export class LocalEventsService {

  public static readonly DELIVERY_CLAIMED_STREAM = new Subject<any>();
  public static get DELIVERY_CLAIMED_EVENTS() {
    return LocalEventsService.DELIVERY_CLAIMED_STREAM.asObservable();
  }

  public static readonly DELIVERY_CREATED_STREAM = new Subject<any>();
  public static get DELIVERY_CREATED_EVENTS() {
    return LocalEventsService.DELIVERY_CREATED_STREAM.asObservable();
  }

}