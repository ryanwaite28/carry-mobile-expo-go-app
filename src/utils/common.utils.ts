import moment from "moment";
import { Observable } from "rxjs";
import { MODERN_APPS, USER_RECORDS } from "../enums/all.enums";
import { IDeliverMeAdmin, IDelivery } from "../interfaces/deliverme.interface";
import { IUser } from "../interfaces/user.interface";
import * as Linking from 'expo-linking';
import { Platform } from "react-native";



export function isJwtFormat(value: any) {
  return !!value && (/[a-zA-Z0-9]+\.[a-zA-Z0-9]+\.[a-zA-Z0-9]+/).test(value);
}

// export function get_distance_spherical_api(params: {
//   from_lat: number;
//   from_lng: number;
//   to_lat: number;
//   to_lng: number;
// }) {
//   /* 
//     https://developers.google.com/maps/documentation/javascript/reference/geometry?hl=en-US#spherical.computeDistanceBetween
//     https://stackoverflow.com/questions/1502590/calculate-distance-between-two-points-in-google-maps-v3
//   */
//   const lat_lng_a = new this.google.maps.LatLng(params.from_lat, params.from_lng);
//   const lat_lng_b = new this.google.maps.LatLng(params.to_lat, params.to_lng);
//   const distance = (this.google.maps.geometry.spherical.computeDistanceBetween(lat_lng_a, lat_lng_b) / 1000).toFixed(2);
//   console.log({ distance });
//   return parseFloat(distance);
// }

export function get_distance_haversine_distance(params: {
  from_lat: number;
  from_lng: number;
  to_lat: number;
  to_lng: number;
}) {
  /*  
    https://developers.google.com/maps/documentation/distance-matrix/overview#DistanceMatrixRequests
    https://cloud.google.com/blog/products/maps-platform/how-calculate-distances-map-maps-javascript-api
  */
  var M = 3958.8; // Radius of the Earth in miles
  var K = 6371.0710; // Radius of the Earth in kilometers

  var rlat1 = params.from_lat * (Math.PI/180); // Convert degrees to radians
  var rlat2 = params.to_lat * (Math.PI/180); // Convert degrees to radians
  var difflat = rlat2-rlat1; // Radian difference (latitudes)
  var difflon = (params.to_lng - params.from_lng) * (Math.PI/180); // Radian difference (longitudes)

  var d = 2 * M * Math.asin(
    Math.sqrt(
      Math.sin(difflat/2) * Math.sin(difflat/2) + Math.cos(rlat1) * Math.cos(rlat2) * Math.sin(difflon/2) * Math.sin(difflon/2)
    )
  );
  return d;
}

export function capitalize(str: string) {
  if (!str) {
    return '';
  } else if (str.length < 2) {
    return str.toUpperCase();
  }
  const Str = str.toLowerCase();
  const capitalized = Str.charAt(0).toUpperCase() + Str.slice(1);
  return capitalized;
}

export const getUserFullName = (user: IUser | IDeliverMeAdmin) => {
  if (user) {
    const { firstname, middlename, lastname } = user;
    const middle = middlename
      ? ` ${middlename} `
      : ` `;

    const displayName = `${firstname}${middle}${lastname}`;
    return displayName;
  } else {
    return '';
  }
};


export const numberFloatRegex = /^-?([\d]+)(.[\d]+)?$/;
export function validateNumber(num: any) {
  if (num === null || num === undefined) { return false; }
  if (typeof(num) !== 'number') { return false; }
  if (isNaN(num) || num === Infinity || num === -Infinity) { return false; }
  
  return numberFloatRegex.test(num.toString());
}

const anonIcon = require(`../../assets/anon.png`);
export const getUserIcon = (user: IUser | IDeliverMeAdmin) => {
  const userIcon = !!user.icon_link ? { uri: user.icon_link } : anonIcon;
  return userIcon;
};

export const getUserIconOrAnon = (user?: IUser | IDeliverMeAdmin) => {
  if (!user) {
    return anonIcon;
  }
  const userIcon = !!user.icon_link ? { uri: user.icon_link } : anonIcon;
  return userIcon;
};

export function getTimeAgo(value: Date | string, hideAgoText: boolean = false) {
  const timeAgo = moment(value).fromNow(hideAgoText);
  return timeAgo;
}

export function formatDateUi(value: Date | string, hideAgoText: boolean = false) {
  const uiDate = moment(value).format("MMM d, y (h:mm a)")
  return uiDate;
}

export function get_user_records_endpoint(
  user_id: number,
  micro_app: MODERN_APPS | string,
  path: USER_RECORDS | string,
  min_id?: number,
  get_all: boolean = false,
  is_public: boolean = true,
  is_slim: boolean = false,
) {
  const app = micro_app.toLowerCase();
  const partial_prefix = is_public ? '/get-' : '/';
  const endpoint = get_all
    ? '/mobile/users/' + user_id + partial_prefix + path + (is_slim ? '-slim' : '') + '/all'
    : min_id
      ? '/mobile/users/' + user_id + `${partial_prefix}` + path + (is_slim ? '-slim' : '') + '/' + min_id
      : '/mobile/users/' + user_id + `${partial_prefix}` + path + (is_slim ? '-slim' : '');
  return endpoint;
}

export function add_on_stripe_processing_fee(amount: number, is_subscription_active, isAmountAdjusted: boolean = false) {
  const stripePercentageFeeRate = 0.0315;
  const appPercentageFeeRate = 0.0425;
  const stripeFixedFeeRate = 30; // 30 cents

  const total = isAmountAdjusted ? amount : parseInt(amount.toString() + '00');

  const stripe_processing_fee = Math.ceil(total * stripePercentageFeeRate) + stripeFixedFeeRate;
  const stripe_final_processing_fee = stripe_processing_fee + stripeFixedFeeRate;

  const app_processing_fee = Math.ceil(total * appPercentageFeeRate) + stripeFixedFeeRate;
  const app_final_processing_fee = app_processing_fee + stripeFixedFeeRate;

  let new_total = Math.round(total + stripe_processing_fee);
  const difference = new_total - total;
  let app_fee = is_subscription_active ? 0 : (parseInt((total * 0.05).toString(), 10));
  const deduction = Math.ceil(total * 0.1);
  const useTotal = is_subscription_active ? total : total - deduction;
  // app_fee = Math.round(difference + app_fee);
  const final_total = Math.round(new_total + app_fee) + stripeFixedFeeRate;
  const refund_amount = final_total - (is_subscription_active ? stripe_processing_fee : app_processing_fee);
  // new_total = new_total + app_fee;
  const data = { amount, final_total, app_fee, stripe_processing_fee, app_processing_fee, new_total, isAmountAdjusted, total: useTotal, difference, refund_amount, is_subscription_active, stripe_final_processing_fee, app_final_processing_fee };
  console.log(data);
  return data;
}

export function formatStripeAmount(amount: number) {
  const valueStrSplit = amount.toString().split('');
  valueStrSplit.splice(valueStrSplit.length - 2, 0, '.');
  const newValue = parseFloat(valueStrSplit.join(''));
  return newValue;
}



export enum MomentFormats {
  FULL = `MMM DD YYYY - h:mm:ss a`,
}

export const timeAgoTransform = (value: string, hideAgoText: boolean = false): string => {
  const timeAgo = moment(value).fromNow(hideAgoText);
  return timeAgo;
};

export const dateTimeTransform = (value: string | Date | number, format: string = MomentFormats.FULL): string => {
  const datetime = moment(value).format(format);
  return datetime;
};

export const dateTimeCompareTransform = (from: string, to: string, format: string = MomentFormats.FULL): string => {
  const datetime = moment(from).diff(to, `minutes`, true);
  if (datetime > 60.0) {
    const text = (datetime / 60).toFixed(2) + ' Hours';
    return text;
  }
  const text = datetime.toFixed(2) + ' Minutes';
  return text;
};



// https://github.com/react-native-maps/react-native-maps/issues/356
export const getBoundByRegion = (region, scale = 1) => {
  /*
  * Latitude : max/min +90 to -90
  * Longitude : max/min +180 to -180
  */
  // Of course we can do it mo compact but it wait is more obvious
  const calcMinLatByOffset = (lng, offset) => {
    const factValue = lng - offset;
    if (factValue < -90) {
      return (90 + offset) * -1;
    }
    return factValue;
  };

  const calcMaxLatByOffset = (lng, offset) => {
    const factValue = lng + offset;
    if (90 < factValue) {
      return (90 - offset) * -1;
    }
    return factValue;
  };

  const calcMinLngByOffset = (lng, offset) => {
    const factValue = lng - offset;
    if (factValue < -180) {
      return (180 + offset) * -1;
    }
    return factValue;
  };

  const calcMaxLngByOffset = (lng, offset) => {
    const factValue = lng + offset;
    if (180 < factValue) {
      return (180 - offset) * -1;
    }
    return factValue;
  };

  const latOffset = region.latitudeDelta / 2 * scale;
  const lngD = (region.longitudeDelta < -180) ? 360 + region.longitudeDelta : region.longitudeDelta;
  const lngOffset = lngD / 2 * scale;

  const data = {
    minLng: calcMinLngByOffset(region.longitude, lngOffset), // westLng - min lng
    minLat: calcMinLatByOffset(region.latitude, latOffset), // southLat - min lat
    maxLng: calcMaxLngByOffset(region.longitude, lngOffset), // eastLng - max lng
    maxLat: calcMaxLatByOffset(region.latitude, latOffset),// northLat - max lat
  };

  const results = {
    ...data,
    swLat: data.minLat,
    swLng: data.minLng,
    neLat: data.maxLat,
    neLng: data.maxLng,
  };

  return results;
}


export enum DeliveryStatus {
  COMPLETED = 'COMPLETED',
  OPEN = 'OPEN',
  STARTED = 'STARTED',
  PICKED_UP = 'PICKED_UP',
  DROPPED_OFF = 'DROPPED_OFF',
}
export function getDeliveryStatus(delivery: IDelivery, you: IUser) {
  const isOwner = you.id === delivery.owner_id;

  const status = delivery.completed
    ? { code: DeliveryStatus.COMPLETED, display: `Completed` }
    : !delivery.carrier_id
      ? { code: DeliveryStatus.OPEN, display: `Open` }
      : (
          !!delivery.datetime_delivered
            ? { code: DeliveryStatus.DROPPED_OFF, display: `Dropped Off - ${isOwner ? 'Review and Pay Carrier' : 'Await Owner Review'}` }
            : !!delivery.datetime_picked_up
              ? { code: DeliveryStatus.PICKED_UP, display: `Picked Up` }
              : { code: DeliveryStatus.STARTED, display: `Started` }
        );

  return status;
}


export const getLinkingListener = () => {
  return new Observable((observer) => {
    (async () => {
      console.log(`listening to linking...`);
      const handler = (ev) => {
        const linkData = Linking.parse(ev.url);
        const info = { ev, linkData, time: Date.now() };
        console.log(`linking ev:`, info);
        observer.next(info);
      };

      const listener = Linking.addEventListener(`url`, handler);

      observer.add(() => {
        listener.remove();
      });
    })()
  });
};


export function addImageToForm(imageName: string, formData: FormData, image?: string) {
  if (image) {
    // https://stackoverflow.com/questions/42521679/how-can-i-upload-a-photo-with-expo
    let localUri = image;
    let filename = localUri.split('/').pop()!;

    // Infer the type of the image
    let match = /\.(\w+)$/.exec(filename);
    let filetype = match ? `image/${match[1]}` : `image`;
    formData.append(imageName, {
      name: filename,
      type: filetype,
      uri: Platform.OS === "android" ? image : image.replace("file://", "")
    } as any);
  }
}

export function prepareFormData(params: {
  payload: any,
  imageName: string,
  imageUri: string,
}) {

  const formData = new FormData();
  formData.append(`payload`, JSON.stringify(params.payload));
  addImageToForm(params.imageName, formData, params.imageUri);
  
  return formData;

}

export function makeUiDate(date_str: string) {
  return dateTimeTransform(date_str) + ' (' + timeAgoTransform(date_str) + ')';
}