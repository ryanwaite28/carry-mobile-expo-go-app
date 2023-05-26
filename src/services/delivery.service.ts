import { MODERN_APPS, USER_RECORDS } from "../enums/all.enums";
import { IDelivery, IDeliveryDispute, IDeliveryDisputeCustomerSupportMessage } from "../interfaces/deliverme.interface";
import { IModelRating } from "../interfaces/_common.interface";
import { ClientService } from "./client.service";
import { UsersService } from "./users.service";



export class DeliveryService {

  static getUserDeliveriesAll<T = any>(user_id: number) {
    return UsersService.get_user_records<T>(
      user_id,
      MODERN_APPS.DELIVERME,
      USER_RECORDS.DELIVERIES,
      undefined,
      true,
      true
    );
  }

  static getUserDeliveries<T = any>(user_id: number, min_id?: number) {
    return UsersService.get_user_records<T>(
      user_id,
      MODERN_APPS.DELIVERME,
      USER_RECORDS.DELIVERIES,
      min_id,
      false,
      true
    );
  }

  static getUserDeliveriesAllSlim<T = any>(user_id: number) {
    return UsersService.get_user_records<T>(
      user_id,
      MODERN_APPS.DELIVERME,
      USER_RECORDS.DELIVERIES,
      undefined,
      true,
      true,
      true
    );
  }

  static getUserDeliveriesSlim<T = any>(user_id: number, min_id?: number) {
    return UsersService.get_user_records<T>(
      user_id,
      MODERN_APPS.DELIVERME,
      USER_RECORDS.DELIVERIES,
      min_id,
      false,
      true,
      true
    );
  }

  static get_delivery_by_id<T = any>(delivery_id: number) {
    return ClientService.sendRequest<T>(`/mobile/deliveries/${delivery_id}`, `GET`);
  }

  static create_delivery<T = any>(data: FormData) {
    return ClientService.sendRequest<T>(`/mobile/deliveries`, `POST`, data);
  }

  static update_delivery<T = any>(data: FormData, delivery_id: number) {
    return ClientService.sendRequest<T>(`/mobile/deliveries/${delivery_id}`, `PUT`, data);
  }

  static delete_delivery<T = any>(delivery_id: number) {
    return ClientService.sendRequest<T>(`/mobile/deliveries/${delivery_id}`, `DELETE`);
  }

  static getUserPastDeliveringsAll<T = any>(user_id: number) {
    return UsersService.get_user_records(
      user_id,
      MODERN_APPS.DELIVERME,
      USER_RECORDS.DELIVERINGS,
      undefined,
      true,
      true
    );
  }

  static getUserPastDeliverings<T = any>(user_id: number, min_id?: number) {
    return UsersService.get_user_records<T>(
      user_id,
      MODERN_APPS.DELIVERME,
      USER_RECORDS.DELIVERINGS,
      min_id,
      false,
      true
    );
  }

  static getUserPastDeliveringsAllSlim<T = any>(user_id: number) {
    return UsersService.get_user_records(
      user_id,
      MODERN_APPS.DELIVERME,
      USER_RECORDS.DELIVERINGS,
      undefined,
      true,
      true,
      true
    );
  }

  static getUserPastDeliveringsSlim<T = any>(user_id: number, min_id?: number) {
    return UsersService.get_user_records<T>(
      user_id,
      MODERN_APPS.DELIVERME,
      USER_RECORDS.DELIVERINGS,
      min_id,
      false,
      true,
      true,
    );
  }

  static getUserDelivering<T = any>(user_id: number) {
    return ClientService.sendRequest<T>(`/mobile/users/${user_id}/delivering`, `GET`);
  }

  static findAvailableDeliveryByFromCityAndState<T = any>(city: string, state: string) {
    return ClientService.sendRequest<T>(`/mobile/deliveries/find-available-from/city/${city}/state/${state}`, `GET`);
  }

  static findAvailableDeliveryByToCityAndState<T = any>(city: string, state: string) {
    return ClientService.sendRequest<T>(`/mobile/deliveries/find-available-to/city/${city}/state/${state}`, `GET`);
  }

  static findAvailableDelivery<T = any>(data: any) {
    return ClientService.sendRequest<T>(`/mobile/deliveries/find-available`, `POST`, data);
  }

  static assignDelivery<T = any>(you_id: number, delivery_id: number) {
    return ClientService.sendRequest<T>(`/mobile/users/${you_id}/assign-delivery/${delivery_id}`, `POST`);
  }

  static unassignDelivery<T = any>(you_id: number, delivery_id: number) {
    return ClientService.sendRequest<T>(`/mobile/users/${you_id}/unassign-delivery/${delivery_id}`, `POST`);
  }

  static markDeliveryAsPickedUp<T = any>(you_id: number, delivery_id: number) {
    return ClientService.sendRequest<T>(`/mobile/users/${you_id}/mark-delivery-as-picked-up/${delivery_id}`, `POST`);
  }

  static markDeliveryAsDroppedOff<T = any>(you_id: number, delivery_id: number) {
    return ClientService.sendRequest<T>(`/mobile/users/${you_id}/mark-delivery-as-dropped-off/${delivery_id}`, `POST`);
  }

  static add_delivered_picture<T = any>(you_id: number, delivery_id: number, data: FormData) {
    return ClientService.sendRequest<T>(`/mobile/users/${you_id}/add-delivered-picture/${delivery_id}`, `POST`, data);
  }

  static add_from_person_id_picture<T = any>(you_id: number, delivery_id: number, data: FormData) {
    return ClientService.sendRequest<T>(`/mobile/users/${you_id}/add-from-person-id-picture/${delivery_id}`, `POST`, data);
  }

  static add_from_person_sig_picture<T = any>(you_id: number, delivery_id: number, data: FormData) {
    return ClientService.sendRequest<T>(`/mobile/users/${you_id}/add-from-person-sig-picture/${delivery_id}`, `POST`, data);
  }

  static add_to_person_id_picture<T = any>(you_id: number, delivery_id: number, data: FormData) {
    return ClientService.sendRequest<T>(`/mobile/users/${you_id}/add-to-person-id-picture/${delivery_id}`, `POST`, data);
  }

  static add_to_person_sig_picture<T = any>(you_id: number, delivery_id: number, data: FormData) {
    return ClientService.sendRequest<T>(`/mobile/users/${you_id}/add-to-person-sig-picture/${delivery_id}`, `POST`, data);
  }

  static markDeliveryAsReturned<T = any>(you_id: number, delivery_id: number) {
    return ClientService.sendRequest<T>(`/mobile/users/${you_id}/mark-delivery-as-returned/${delivery_id}`, `POST`);
  }

  static markDeliveryAsCompleted<T = any>(you_id: number, delivery_id: number) {
    return ClientService.sendRequest<T>(`/mobile/users/${you_id}/mark-delivery-as-completed/${delivery_id}`, `POST`);
  }

  static createTrackingUpdate<T = any>(you_id: number, delivery_id: number, data: FormData) {
    return ClientService.sendRequest<T>(`/mobile/users/${you_id}/create-tracking-update/${delivery_id}`, `POST`, data);
  }

  static addDeliveredPicture<T = any>(you_id: number, delivery_id: number, data: FormData) {
    return ClientService.sendRequest<T>(`/mobile/users/${you_id}/add-delivered-picture/${delivery_id}`, `POST`, data);
  }
  
  static getUserDelivermeSettings<T = any>(you_id: number) {
    return ClientService.sendRequest<T>(`/mobile/users/${you_id}/settings`, `GET`);
  }
  
  static updateUserDelivermeSettings<T = any>(you_id: number, data: any) {
    return ClientService.sendRequest<T>(`/mobile/users/${you_id}/settings`, `POST`, data);
  }
  
  static searchDeliveries(data: any) {
    return ClientService.sendRequest<IDelivery[]>(`/mobile/deliveries/search`, `POST`, data);
  }
  
  static sendDeliveryMessage<T = any>(data: any) {
    return ClientService.sendRequest<T>(`/mobile/deliveries/${data.delivery_id}/message`, `POST`, data);
  }
  
  static payCarrier<T = any>(you_id: number, delivery_id: number) {
    return ClientService.sendRequest<T>(`/mobile/deliveries/${delivery_id}/pay-carrier`, `POST`);
  }

  static createPaymentIntent<T = any>(delivery_id: number) {
    return ClientService.sendRequest<T>(`/mobile/deliveries/${delivery_id}/create-payment-intent`, `POST`);
  }

  static browseRecent(delivery_id?: number) {
    const endpoint = delivery_id
      ? `/mobile/deliveries/browse-recent/${delivery_id}`
      : `/mobile/deliveries/browse-recent`;
    return ClientService.sendRequest<IDelivery[]>(endpoint, `POST`, null);
  }

  static browseMap(params: {
    northEast: { lat: number, lng: number },
    southWest: { lat: number, lng: number },
  }) {
    const { northEast, southWest } = params;
    const endpoint = `/mobile/deliveries/browse-map/swlat/${southWest.lat}/swlng/${southWest.lng}/nelat/${northEast.lat}/nelng/${northEast.lng}`;
    return ClientService.sendRequest<IDelivery[]>(endpoint, `POST`, null);
  }

  static getUserStats(user_id: number) {
    return ClientService.sendRequest<{
      user_ratings_info: IModelRating | null,
      writer_ratings_info: IModelRating | null,
    }>(`/mobile/users/${user_id}/stats`, `GET`, null);
  }

  static request_carrier_location<T = any>(delivery_id: number) {
    return ClientService.sendRequest<T>(`/mobile/deliveries/${delivery_id}/request-carrier-location`, `POST`);
  }

  static accept_request_carrier_location<T = any>(delivery_id: number) {
    return ClientService.sendRequest<T>(`/mobile/deliveries/${delivery_id}/accept-request-carrier-location`, `POST`);
  }

  static decline_request_carrier_location<T = any>(delivery_id: number) {
    return ClientService.sendRequest<T>(`/mobile/deliveries/${delivery_id}/decline-request-carrier-location`, `POST`);
  }

  static carrier_share_location<T = any>(delivery_id: number) {
    return ClientService.sendRequest<T>(`/mobile/deliveries/${delivery_id}/carrier-share-location`, `POST`);
  }

  static carrier_unshare_location<T = any>(delivery_id: number) {
    return ClientService.sendRequest<T>(`/mobile/deliveries/${delivery_id}/carrier-unshare-location`, `POST`);
  }

  static carrier_update_location<T = any>(params: {
    delivery_id: number,
    carrier_latest_lat: number,
    carrier_latest_lng: number,
  }) {
    return ClientService.sendRequest<T>(`/mobile/deliveries/${params.delivery_id}/carrier-update-location`, `POST`, params);
  }


  // dispute routes
  static create_delivery_dispute<T = any>(delivery_id: number, data: any) {
    return ClientService.sendRequest<T>(`/mobile/deliveries/${delivery_id}/create-delivery-dispute`, `POST`, data);
  }

  static create_delivery_dispute_log<T = any>(delivery_id: number, data: any) {
    return ClientService.sendRequest<T>(`/mobile/deliveries/${delivery_id}/create-delivery-dispute-log`, `POST`, data);
  }

  static create_delivery_dispute_customer_service_message<T = any>(delivery_id: number, data: any) {
    return ClientService.sendRequest<T>(`/mobile/deliveries/${delivery_id}/create-delivery-dispute-customer-support-message`, `POST`, data);
  }

  static make_delivery_dispute_settlement_offer<T = any>(delivery_id: number, data: any) {
    return ClientService.sendRequest<T>(`/mobile/deliveries/${delivery_id}/make-delivery-dispute-settlement-offer`, `POST`, data);
  }

  static cancel_delivery_dispute_settlement_offer<T = any>(delivery_id: number) {
    return ClientService.sendRequest<T>(`/mobile/deliveries/${delivery_id}/cancel-delivery-dispute-settlement-offer`, `POST`);
  }

  static accept_delivery_dispute_settlement_offer<T = any>(delivery_id: number, data: any) {
    return ClientService.sendRequest<T>(`/mobile/deliveries/${delivery_id}/accept-delivery-dispute-settlement-offer`, `POST`, data);
  }

  static decline_delivery_dispute_settlement_offer<T = any>(delivery_id: number) {
    return ClientService.sendRequest<T>(`/mobile/deliveries/${delivery_id}/decline-delivery-dispute-settlement-offer`, `POST`);
  }


  static get_delivery_dispute_by_delivery_id<T = any>(delivery_id: number) {
    return ClientService.sendRequest<IDeliveryDispute>(`/mobile/deliveries/${delivery_id}/dispute`, `GET`);
  }

  static get_delivery_dispute_info_by_delivery_id<T = any>(delivery_id: number) {
    return ClientService.sendRequest<IDeliveryDispute>(`/mobile/deliveries/${delivery_id}/dispute-info`, `GET`);
  }


  static get_user_dispute_messages_by_user_id_and_dispute_id(delivery_id: number) {
    return ClientService.sendRequest<IDeliveryDisputeCustomerSupportMessage[]>(`/mobile/deliveries/${delivery_id}/dispute-messages`, `GET`);
  }
}