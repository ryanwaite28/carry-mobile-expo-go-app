import AsyncStorage from '@react-native-async-storage/async-storage';
// import EncryptedStorage from 'react-native-encrypted-storage';
import * as SecureStore from 'expo-secure-store';



// async storage
// export class SafeStorageService {
//   static async storeData (name: string, value: any) {
//     try {
//       await AsyncStorage.setItem(name, value);
//     } catch (e) {
//       console.log(e);
//     }
//   }

//   static async storeObject (name: string, value: any) {
//     try {
//       await AsyncStorage.setItem(name, JSON.stringify(value));
//     } catch (e) {
//       console.log(e);
//     }
//   }

//   static async getData (name: string) {
//     try {
//       const data = await AsyncStorage.getItem(name);
//       return data;
//     } catch (e) {
//       console.log(e);
//     }
//   }

//   static async getObject (name: string) {
//     try {
//       const data = await AsyncStorage.getItem(name);
//       const parsed = data && JSON.parse(data);
//       return parsed;
//     } catch (e) {
//       console.log(e);
//     }
//   }

//   static async removeData (name: string) {
//     try {
//       const data = await AsyncStorage.removeItem(name);
//     } catch (e) {
//       console.log(e);
//     }
//   }
// }



// safe async storage
export class SafeStorageService {
  static async storeData (name: string, value: any) {
    try {
      await SecureStore.setItemAsync(name, value);
    } catch (e) {
      console.log(e);
    }
  }

  static async storeObject (name: string, value: any) {
    try {
      await SecureStore.setItemAsync(name, JSON.stringify(value));
    } catch (e) {
      console.log(e);
    }
  }

  static async getData (name: string) {
    try {
      const data = await SecureStore.getItemAsync(name);
      return data;
    } catch (e) {
      console.log(e);
    }
  }

  static async getObject (name: string) {
    try {
      const data = await SecureStore.getItemAsync(name);
      const parsed = data && JSON.parse(data);
      return parsed;
    } catch (e) {
      console.log(e);
    }
  }

  static async removeData (name: string) {
    try {
      const data = await SecureStore.deleteItemAsync(name);
    } catch (e) {
      console.log(e);
    }
  }
}