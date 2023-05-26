import { BehaviorSubject, catchError, flatMap, from, map, mergeMap, Observable, of } from "rxjs";
import { MODERN_APPS, USER_RECORDS } from "../enums/all.enums";
import { PlainObject } from "../interfaces/json-object.interface";
import { GenericApiResponse, GetVerifySmsCode, IPositionStackLocationData } from "../interfaces/responses.interface";
import { IUser } from "../interfaces/user.interface";
import { IApiKey, IUserField, IUserNotificationsLastOpenedByApp, ServiceMethodResultsInfo } from "../interfaces/_common.interface";
import { get_user_records_endpoint, isJwtFormat } from "../utils/common.utils";
import { AppConstants } from "./app.constants";
import { AppGlobalState } from "./app.state";
import { ClientService } from "./client.service";
import { SafeStorageService } from "./storage.service";
import { UserStoreService } from "./user-store.service";



export class UsersService {
  session: GenericApiResponse | any;
  sessionChecked: boolean = false;
  private notificationsLastOpenedByApp: PlainObject<IUserNotificationsLastOpenedByApp> = {};
  
  // static checkUserSession(): Observable<IUser | null> {
  //   return UserStoreService.getChangesObs().pipe(
  //     flatMap((you: IUser | null) => {
  //       console.log(`UsersService.checkUserSession`, { you });
  //       return you !== undefined
  //         ? of(you)
  //         : UsersService.checkSession().pipe(
  //             map((response: ServiceMethodResultsInfo<any>) => {
  //               return (response.data.you as IUser) || null;
  //             })
  //           );
  //     })
  //   );
  // }

  static checkUserSession(): Observable<IUser | null> {
    return UsersService.checkSession().pipe(
      map((response: ServiceMethodResultsInfo<any>) => {
        return (response.data.you as IUser) || null;
      })
    );
  }

  static checkSession(): Observable<ServiceMethodResultsInfo<any>> {
    return from(SafeStorageService.getData(AppConstants.JWT_NAME)).pipe(
      flatMap((jwt: string | null | undefined) => {
        if (!jwt || jwt === `undefined` || !isJwtFormat(jwt)) {
          return from(SafeStorageService.removeData(AppConstants.JWT_NAME)).pipe(
            map(() => {
              UserStoreService.setState(null);
              return (<ServiceMethodResultsInfo<any>> {
                message: `no token found`,
                data: {
                  online: false,
                  you: null,
                  token: null,
                }
              });
            })
          );
        }

        const observable = ClientService.sendRequest<any>(
          '/mobile/users/check-session',
          `GET`,
          null,
          // {
          //   headers: {
          //     'Accept': 'application/json',
          //     'Content-Type': 'application/json',
          //   }
          // }
        ).pipe(
          mergeMap((response: ServiceMethodResultsInfo<any>) => {
            console.log(`======= checkUserSession`, { response });
            const storagePromise = SafeStorageService.storeData(AppConstants.JWT_NAME, response.data.token).then(() => {
              UserStoreService.setState(response.data.you);
              UserStoreService.is_subscription_active = response.data!.is_subscription_active;
              UserStoreService.is_subscription_active_stream.next(UserStoreService.is_subscription_active);
            });
            return from(storagePromise).pipe(map(() => response));
          })
        );
        
        return observable;
      })
    );
  }

  static loadGoogleMaps() {
    return ClientService.sendRequest(`/mobile/common/utils/get-google-api-key`, 'PUT')
      .pipe(map((response: any, index: number) => {
        AppGlobalState.GOOGLE_API_KEY = response.data.key;
        console.log(`google key loaded:`, { GOOGLE_API_KEY: AppGlobalState.GOOGLE_API_KEY });
        return response;
      }))
  }

  static loadStripe() {
    return ClientService.sendRequest(`/mobile/common/utils/get-stripe-public-key`, 'PUT')
      .pipe(map((response: any, index: number) => {
        AppGlobalState.STRIPE_PUBLIC_KEY = response.data.key;
        console.log(`Stripe PK loaded`, { STRIPE_PUBLIC_KEY: AppGlobalState.STRIPE_PUBLIC_KEY });
        return response;
      }))
  }

  static get_location_via_coordinates(lat: number|string, lng: number|string) {
    return ClientService.sendRequest<IPositionStackLocationData>(`/mobile/common/utils/get-location-via-coordinates/${lat}/${lng}`, 'PUT')
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  static loadGooglePlaceDetails(place_id: string) {
    return from(ClientService.axios.get(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&key=${AppGlobalState.GOOGLE_API_KEY}`))
      .pipe(map((response) => {
        return response.data.result;
      }))
  }

  static sign_out() {
    console.log(`\nUsersService.signout called\n`);

    SafeStorageService.getData(`EXPO_TOKEN`).then((expo_token) => {
      if (!expo_token) {
        console.log(`expo_token not found...`);
        return;
      }
      const you_id = UserStoreService.getLatestState()!.id;
      UsersService.remove_expo_device_and_push_token(you_id, expo_token)
      .subscribe({
        next: (response) => {
          console.log(`Removed expo token:`, response);
        }
      });
    });
    

    return from(
      SafeStorageService.removeData(AppConstants.JWT_NAME).then(() => {
        console.log(`removed.`);
        UserStoreService.is_subscription_active = false
        UserStoreService.is_subscription_active_stream.next(UserStoreService.is_subscription_active);
        UserStoreService.setState(null);
      })
    )
  }

  static verify_email(uuid: string): Observable<GenericApiResponse> {
    const endpoint = '/mobile/users/verify-email/' + uuid;
    return ClientService.sendRequest<GenericApiResponse>(endpoint, `GET`).pipe(
      map((response) => {
        SafeStorageService.removeData(AppConstants.JWT_NAME).then(() => {
          UserStoreService.setState(null);
        });
        return response;
      })
    );
  }

  static send_sms_verification(phone: string): Observable<GenericApiResponse> {
    const endpoint = '/mobile/users/send-sms-verification/' + phone;
    return ClientService.sendRequest<GenericApiResponse>(endpoint, `GET`).pipe(
      map((response) => {
        return response;
      })
    );
  }

  static verify_sms_code(params: {
    request_id: string,
    code: string,
    phone: string,
  }): Observable<GetVerifySmsCode> {
    const { request_id, code, phone } = params;
    const endpoint = `/mobile/users/verify-sms-code/request_id/${request_id}/code/${code}/phone/${phone}`;
    return ClientService.sendRequest<GetVerifySmsCode>(endpoint, `GET`).pipe(
      map((response: any) => {
        SafeStorageService.storeData(AppConstants.JWT_NAME, response.data.token).then(() => {
          UserStoreService.setState(response.data.you);
        });
        return response;
      })
    );
  }

  static send_feedback(you_id: number, data: PlainObject) {
    const endpoint = `/mobile/users/${you_id}/feedback`;
    return ClientService.sendRequest<any>(endpoint, `POST`, data).pipe(
      map((response: any) => {
        return response;
      })
    );
  }

  static register_expo_device_and_push_token(you_id: number, data: PlainObject) {
    const endpoint = `/mobile/users/${you_id}/register-expo-push-token`;
    return ClientService.sendRequest<any>(endpoint, `PUT`, data).pipe(
      map((response: any) => {
        return response;
      })
    );
  }

  static remove_expo_device_and_push_token(you_id: number, token: string) {
    const endpoint = `/mobile/users/${you_id}/remove-expo-push-token/${token}`;
    return ClientService.sendRequest<any>(endpoint, `DELETE`).pipe(
      map((response: any) => {
        return response;
      })
    );
  }

  /** */

  static get_user_records<T>(
    user_id: number,
    app: MODERN_APPS,
    path: USER_RECORDS,
    min_id?: number,
    get_all: boolean = false,
    is_public: boolean = true,
    is_slim: boolean = false,
  ) {
    const endpoint = get_user_records_endpoint(user_id, app, path, min_id, get_all, is_public, is_slim);
    return ClientService.sendRequest(endpoint, `GET`).pipe(
      map((response) => {
        return response;
      })
    );
  }

  static get_user_by_id(id: number) {
    const endpoint = '/mobile/users/id/' + id;
    return ClientService.sendRequest<IUser>(endpoint, `GET`).pipe(
      map((response) => {
        return response;
      })
    );
  }

  static get_user_home_page_stats(id: number) {
    const endpoint = `/mobile/users/${id}/home-stats`;
    return ClientService.sendRequest<PlainObject<number>>(endpoint, `GET`).pipe(
      map((response) => {
        return response;
      })
    );
  }

  static get_user_by_phone(phone: string) {
    const endpoint = '/mobile/users/phone/' + phone;
    return ClientService.sendRequest<IUser>(endpoint, `GET`).pipe(
      map((response) => {
        return response;
      })
    );
  }

  static get_user_followers_count(user_id: number) {
    const endpoint = `/mobile/users/${user_id}/followers-count`;
    return ClientService.sendRequest<any>(endpoint, `GET`).pipe(
      map((response) => {
        return response;
      })
    );
  }

  static get_user_followings_count(user_id: number) {
    const endpoint = `/mobile/users/${user_id}/followings-count`;
    return ClientService.sendRequest<any>(endpoint, `GET`).pipe(
      map((response) => {
        return response;
      })
    );
  }

  static get_user_messagings(you_id: number, messagings_timestamp?: string, get_all: boolean = false) {
    const endpoint = get_all
      ? '/mobile/users/' + you_id + '/messagings/all'
      : messagings_timestamp
        ? '/mobile/users/' + you_id + '/messagings/' + messagings_timestamp
        : '/mobile/users/' + you_id + '/messagings';
    return ClientService.sendRequest<any>(endpoint, `GET`).pipe(
      map((response) => {
        return response;
      })
    );
  }

  static get_user_messages_all(you_id: number, user_id: number) {
    const endpoint = '/mobile/users/' + you_id + '/messages/' + user_id + '/all';
    return ClientService.sendRequest<any>(endpoint, `GET`).pipe(
      map((response) => {
        return response;
      })
    );
  }

  static get_user_messages(you_id: number, user_id: number, min_id?: number) {
    const endpoint = min_id
      ? '/mobile/users/' + you_id + '/messages/' + user_id + '/' + min_id
      : '/mobile/users/' + you_id + '/messages/' + user_id;
    return ClientService.sendRequest<any>(endpoint, `GET`).pipe(
      map((response) => {
        return response;
      })
    );
  }

  static get_unseen_counts(you_id: number) {
    const endpoint = `/mobile/users/${you_id}/unseen-counts`;
    return ClientService.sendRequest<any>(endpoint, `GET`).pipe(
      map((response) => {
        return response;
      })
    );
  }

  static get_account_info(you_id: number) {
    const endpoint = `/mobile/users/${you_id}/account-info`;
    return ClientService.sendRequest<any>(endpoint, `GET`).pipe(
      map((response) => {
        return response;
      })
    );
  }

  static stripe_login(you_id: number) {
    const endpoint = `/mobile/users/${you_id}/stripe-login`;
    return ClientService.sendRequest<any>(endpoint, `GET`).pipe(
      map((response) => {
        return response;
      })
    );
  }

  static get_platform_subscription(you_id: number) {
    const endpoint = `/mobile/users/${you_id}/get-subscription`;
    return ClientService.sendRequest<any>(endpoint, `GET`).pipe(
      map((response) => {
        return response;
      })
    );
  }

  static get_user_api_key(you_id: number) {
    const endpoint = `/mobile/users/${you_id}/api-key`;
    return ClientService.sendRequest<IApiKey>(endpoint, `GET`).pipe(
      map((response) => {
        return response;
      })
    );
  }

  static get_user_customer_cards_payment_methods(you_id: number) {
    const endpoint = `/mobile/users/${you_id}/customer-cards-payment-methods`;
    return ClientService.sendRequest<any>(endpoint, `GET`).pipe(
      map((response) => {
        return response;
      })
    );
  }

  static find_users_by_name(query_term: string) {
    const endpoint = `/mobile/common/find/users/name?query_term=${query_term}`;
    return ClientService.sendRequest<any>(endpoint, `GET`).pipe(
      map((response) => {
        return response;
      })
    );
  }

  static find_users_by_username(query_term: string) {
    const endpoint = `/mobile/common/find/users/username?query_term=${query_term}`;
    return ClientService.sendRequest<any>(endpoint, `GET`).pipe(
      map((response) => {
        return response;
      })
    );
  }

  static find_users_by_name_or_username(query_term: string) {
    const endpoint = `/mobile/common/find/users/name-or-username?query_term=${query_term}`;
    return ClientService.sendRequest<any>(endpoint, `GET`).pipe(
      map((response) => {
        return response;
      })
    );
  }

  // generic

  static get_random_models(
    you_id: number,
    model_name: string,
    industry: string = '',
    gallup_strength: string = '',
    pred_ref_profile: string = '',
    cause: string = '',
  ) {
    const endpoint = `/mobile/users/${you_id}/random?model_name=${model_name}&industry=${industry}&gallup_strength=${gallup_strength}&pred_ref_profile=${pred_ref_profile}&cause=${cause}`;
    return ClientService.sendRequest<any>(endpoint, `GET`).pipe(
      map((response) => {
        return response;
      })
    );
  }

  static get_user_feed(you_id: number, feed_type: string, min_id?: number) {
    const endpoint = min_id
      ? `/mobile/users/${you_id}/feed/${min_id}?feed_type=${feed_type}`
      : `/mobile/users/${you_id}/feed?feed_type=${feed_type}`;
    return ClientService.sendRequest<any>(endpoint, `GET`).pipe(
      map((response) => {
        return response;
      })
    );
  }

  /** POST */

  static sign_up(data: PlainObject) {
    return ClientService.sendRequest<any>('/mobile/users', `POST`, data).pipe(
      mergeMap((response) => {
        return from(SafeStorageService.storeData(AppConstants.JWT_NAME, response.data.token).then(() => {
          UserStoreService.setState(response.data.you);
        }))
        .pipe(map(() => response));
      })
    );
  }

  static create_user_field(id: number, data: PlainObject) {
    return ClientService.sendRequest<GenericApiResponse<IUserField>>(`/mobile/users/${id}/user-field`, `POST`, data).pipe(
      map((response) => {
        return response;
      })
    );
  }

  static follow_user(you_id: number, user_id: number) {
    const endpoint = `/mobile/users/${you_id}/follows/${user_id}`;
    return ClientService.sendRequest<any>(endpoint, `POST`).pipe(
      map((response) => {
        return response;
      })
    );
  }

  static send_user_message(you_id: number, user_id: number, data: PlainObject) {
    return ClientService.sendRequest<any>(`/mobile/users/${you_id}/send-message/${user_id}`, `POST`, data).pipe(
      map((response) => {
        return response;
      })
    );
  }

  static update_user_last_opened(you_id: number) {
    return ClientService.sendRequest<any>(`/mobile/users/${you_id}/notifications/update-last-opened`, `POST`).pipe(
      mergeMap((response) => {
        return from(SafeStorageService.storeData(AppConstants.JWT_NAME, response.data.token).then(() => {
          UserStoreService.setState(response.data.you);
        }))
        .pipe(map(() => response));
      })
    );
  }

  static getUserNotificationsAll<T = any>(user_id: number) {
    return UsersService.get_user_records<T>(
      user_id,
      MODERN_APPS.COMMON,
      USER_RECORDS.NOTIFICATIONS,
      undefined,
      true,
      false
    );
  }

  static getUserNotifications<T = any>(user_id: number, min_id?: number) {
    return UsersService.get_user_records<T>(
      user_id,
      MODERN_APPS.COMMON,
      USER_RECORDS.NOTIFICATIONS,
      min_id,
      false,
      false
    );
  }

  
  /** PUT */
  
  static create_stripe_account<T = any>(you_id: number, returnUrl: string) {
    const useUrl = returnUrl || `http://modernapps.cf/users/${you_id}/verify-stripe-account`;
    return ClientService.sendRequest<GenericApiResponse<T>>(
      `/mobile/users/${you_id}/create-stripe-account?refreshUrl=${returnUrl}&redirectUrl=${returnUrl}`, `PUT`, { refreshUrl: useUrl, redirectUrl: useUrl }
    ).pipe(
      map((response: any) => {
        return response;
      })
    );
  }

  static add_card_payment_method_to_user_customer(you_id: number, payment_method_id: string) {
    const endpoint = `/mobile/users/${you_id}/customer-cards-payment-methods/${payment_method_id}`;
    return ClientService.sendRequest<any>(endpoint, `POST`).pipe(
      map((response) => {
        return response;
      })
    );
  }

  static remove_card_payment_method_to_user_customer(you_id: number, payment_method_id: string) {
    const endpoint = `/mobile/users/${you_id}/customer-cards-payment-methods/${payment_method_id}`;
    return ClientService.sendRequest<any>(endpoint, `DELETE`).pipe(
      map((response) => {
        return response;
      })
    );
  }

  static create_subscription(you_id: number, payment_method_id: string) {
    const endpoint = `/mobile/users/${you_id}/create-subscription/${payment_method_id}`;
    return ClientService.sendRequest<any>(endpoint, `POST`).pipe(
      mergeMap((response) => {
        UserStoreService.is_subscription_active = true;
        UserStoreService.is_subscription_active_stream.next(UserStoreService.is_subscription_active);
        return from(SafeStorageService.storeData(AppConstants.JWT_NAME, response.data.token).then(() => {
          UserStoreService.setState(response.data.you);
        }))
        .pipe(map(() => response));
      })
    );
  }

  static cancel_subscription(you_id: number) {
    const endpoint = `/mobile/users/${you_id}/cancel-subscription`;
    return ClientService.sendRequest<any>(endpoint, `POST`).pipe(
      map((response) => {
        return response;
      })
    );
  }

  static verify_stripe_account<T = any>(you_id: number) {
    return ClientService.sendRequest<GenericApiResponse<T>>(
      `/mobile/users/${you_id}/verify-stripe-account`, `PUT`
    ).pipe(
      map((response: any) => {
        return response;
      })
    );
  }

  static sign_in(data: PlainObject) {
    return ClientService.sendRequest<any>(`/mobile/users`, `PUT`, data).pipe(
      mergeMap((response) => {
        return from(SafeStorageService.storeData(AppConstants.JWT_NAME, response.data.token).then(() => {
          UserStoreService.setState(response.data.you);
        }))
        .pipe(map(() => response));
      })
    );
  }

  static update_info(id: number, data: PlainObject) {
    const endpoint = `/mobile/users/${id}/info`;
    return ClientService.sendRequest<any>(endpoint, `PUT`, data).pipe(
      mergeMap((response) => {
        return from(SafeStorageService.storeData(AppConstants.JWT_NAME, response.data.token).then(() => {
          UserStoreService.setState(response.data.you);
        }))
        .pipe(map(() => response));
      })
    );
  }

  static update_password(id: number, data: PlainObject) {
    const endpoint = `/mobile/users/${id}/password`;
    return ClientService.sendRequest<any>(endpoint, `PUT`, data).pipe(
      mergeMap((response) => {
        return from(SafeStorageService.storeData(AppConstants.JWT_NAME, response.data.token).then(() => {
          UserStoreService.setState(response.data.you);
        }))
        .pipe(map(() => response));
      })
    );
  }

  static update_phone(id: number, data: PlainObject) {
    const endpoint = `/mobile/users/${id}/phone`;
    return ClientService.sendRequest<any>(endpoint, `PUT`, data).pipe(
      mergeMap((response) => {
        return from(SafeStorageService.storeData(AppConstants.JWT_NAME, response.data.token).then(() => {
          UserStoreService.setState(response.data.you);
        }))
        .pipe(map(() => response));
      })
    );
  }

  static update_icon(id: number, formData: FormData) {
    const endpoint = `/mobile/users/${id}/icon`;
    return ClientService.sendRequest<any>(endpoint, `PUT`, formData).pipe(
      mergeMap((response) => {
        return from(SafeStorageService.storeData(AppConstants.JWT_NAME, response.data.token).then(() => {
          UserStoreService.setState(response.data.you);
        }))
        .pipe(map(() => response));
      })
    );
  }

  static update_wallpaper(id: number, formData: FormData) {
    const endpoint = `/mobile/users/${id}/wallpaper`;
    return ClientService.sendRequest<any>(endpoint, `PUT`, formData).pipe(
      mergeMap((response) => {
        return from(SafeStorageService.storeData(AppConstants.JWT_NAME, response.data.token).then(() => {
          UserStoreService.setState(response.data.you);
        }))
        .pipe(map(() => response));
      })
    );
  }

  static update_user_field(you_id: number, id: number, data: PlainObject) {
    const endpoint = `/mobile/users/${you_id}/user-field/${id}`;
    return ClientService.sendRequest<IUserField>(endpoint, `PUT`, data).pipe(
      map((response) => {
        return response;
      })
    );
  }

  static update_latest_coordinates(you_id: number, data: { lat: number, lng: number, automated: boolean }) {
    const endpoint = `/mobile/users/${you_id}/latest-coordiates`;
    return ClientService.sendRequest<any>(endpoint, `PUT`, data).pipe(
      mergeMap((response) => {
        return from(SafeStorageService.storeData(AppConstants.JWT_NAME, response.data.token).then(() => {
          UserStoreService.setState(response.data.you);
        }))
        .pipe(map(() => response));
      })
    );
  }
  

  /** DELETE */

  static delete_user_field(you_id: number, id: number) {
    const endpoint = `/mobile/users/${you_id}/user-field/${id}`;
    return ClientService.sendRequest<GenericApiResponse>(endpoint, `DELETE`).pipe(
      map((response) => {
        return response;
      })
    );
  }
}