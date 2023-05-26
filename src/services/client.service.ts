import { Observable } from "rxjs";
import { ServiceMethodResultsInfo } from "../interfaces/_common.interface";
import { AppConstants } from "./app.constants";
import { SafeStorageService } from "./storage.service";
import Constants from "expo-constants";
import * as Axios from 'axios';







const axios = Axios.default;


const API_CONFIGS = {
  local: {
    PORT: `80`,
    DOMAIN: `http://192.168.4.135`,
  },
  development: {
    PORT: `80`,
    DOMAIN: `https://rmw-modern-server-dev.herokuapp.com`,
  },
  production: {
    PORT: `80`,
    DOMAIN: `https://rmw-modern-server.herokuapp.com`,
  },
};


const USE_API_CONFIG = process.env.NODE_ENV && (process.env.NODE_ENV in API_CONFIGS)
  ? API_CONFIGS[process.env.NODE_ENV]
  : API_CONFIGS.local;

console.log(`client.service.ts`, {
  expoExtra: Constants.expoConfig?.extra,
  env: process.env,
  USE_API_CONFIG
});





export class ClientService {

  static readonly BASE_PATH: string = '';
  // static readonly API: string = `${USE_API_CONFIG.DOMAIN}:${USE_API_CONFIG.PORT}` + ClientService.BASE_PATH;
  static readonly DOMAIN: string = `${Constants.expoConfig?.extra?.API_DOMAIN}:${Constants.expoConfig?.extra?.API_PORT}`;
  static readonly API: string = `${Constants.expoConfig?.extra?.API_DOMAIN}:${Constants.expoConfig?.extra?.API_PORT}` + ClientService.BASE_PATH;

  static readonly axios = axios;

  constructor() {

  }

  static sendRequest<T = any>(
    route: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    data?: object | FormData | null,
    overrideOptions?: any,
  ): Observable<ServiceMethodResultsInfo<T>> {
    return new Observable((observer) => {
      SafeStorageService.getData(AppConstants.JWT_NAME).then((jwt: string | null | undefined) => {
        const api_url = route.startsWith(`http`) ? route : ClientService.API + route;
        
        const headers: any = {
          'Accept': 'application/json',
        };

        const isJsonData = !!data && data.constructor === Object;
        // console.log({ data, isJsonData });
        if (isJsonData) {
          headers['Content-Type'] = 'application/json';
        }
        else if (!!data && data.constructor === FormData) {
          // console.log(`is form data =====`);
          headers['Content-Type'] = 'multipart/form-data';
        }
        
        const fetchOptions: any = {
          method,
          headers,
          // credentials: 'include',
        }
        if (overrideOptions) {
          Object.assign(fetchOptions, overrideOptions);
        }
        
        const body = isJsonData ? JSON.stringify(data) : (<FormData> data);
        switch (method) {
          case 'POST':
          case 'PUT': {
            if (data) {
              fetchOptions['body'] = body;
            }
            break;
          }
        }

        fetchOptions.headers['Authorization'] = `Bearer ${jwt}`;

        const axiosRequestOptions = {
          url: api_url,
          method: method.toLowerCase(),
          headers: fetchOptions.headers,
          data,
        };
          
        console.log(`\n\nfetching...`, api_url, `\n\n`);
        console.log(`\n\n`, fetchOptions, axiosRequestOptions, `\n\n`);

        (async () => {
          try {
            // console.log(`\n\n\n===== requested started =====`);
            const response = await axios.request(axiosRequestOptions);
            // console.log(`\n\n`);
            // console.log({ response });
            // console.log({ response_data: JSON.stringify(response.data) });
            // console.log(`\n\n`);
  
            observer.next(response.data as ServiceMethodResultsInfo<T>);
          }
          catch (error: Axios.AxiosError | any) {
            console.log(`axios error block`);
            console.log({ axios_error: error });
            observer.error(error);
    
            if (error.response) {
              // The request was made and the server responded with a status code
              // that falls out of the range of 2xx
              console.log(`Axios Error Response:`);
              console.log(error.response.data);
              console.log(error.response.status);
              console.log(error.response.headers);
            }
            else if (error.request) {
              // The request was made but no response was received
              // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
              // http.ClientRequest in node.js
              console.log(error.request);
            }
            else {
              // Something happened in setting up the request that triggered an Error
              console.log('Error', error.message);
            }
          }
          finally {
            // console.log(`===== requested ended =====\n\n\n`);
            observer.complete();
          }
        })();

        /*
        fetch(api_url, fetchOptions)
          .then(async (response: Response) => {
            const isError = (
              response.status.toString().startsWith('4') ||
              response.status.toString().startsWith('5')
            );
            const isJson = response.headers.get('content-type') === `application/json`;
            const data: any = isJson ? await response.json() : null;
            console.log(`response`, response, {isError, isJson, data});
            if (isError) {
              throw new Error(`Response error...`);
            }
            return response.json();
          })
          .then((results) => {
            console.log({results});
            if (results.isError) {
              observer.error(results.data as ServiceMethodResultsInfo<T>);
              observer.complete();
              return;
            }

            observer.next(results.data as ServiceMethodResultsInfo<T>);
            observer.complete();
          })
          .catch((error) => {
            console.error(`fetch error`, error);
            observer.error(error);
            observer.complete();
          });
          */
      });
    });
  }
}