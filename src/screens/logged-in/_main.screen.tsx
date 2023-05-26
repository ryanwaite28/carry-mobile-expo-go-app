import { BottomTabNavigationOptions, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// https://icons.expo.fyi/
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { StylesConstants } from '../../services/styles.constants';
import { UserSettingsScreen } from './settings/_user-settings.screen';
import { UserHomeScreen } from './home/_user-home.screen';
import { UserDeliveriesScreen } from './deliveries/_user-deliveries.screen';
import { UserDeliveringScreen } from './delivering/_user-delivering.screen';
import { UserSearchScreen } from './search/_user-search.screen';
import React, { useEffect, useRef, useState } from 'react';
import { Platform, Alert } from 'react-native';
import { UserStoreService } from '../../services/user-store.service';
import { IUser } from '../../interfaces/user.interface';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { UsersService } from '../../services/users.service';
import { PlainObject } from '../../interfaces/json-object.interface';
import { AppGlobalState } from '../../services/app.state';
import { DeliveryService } from '../../services/delivery.service';
import { IDelivery } from '../../interfaces/deliverme.interface';
import { PermissionStatus, getCurrentPositionAsync, requestForegroundPermissionsAsync } from 'expo-location';
import { firstValueFrom } from 'rxjs';
import { LocalEventsService } from '../../services/local-events.service';
import { SafeStorageService } from '../../services/storage.service';


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});



const Tab = createBottomTabNavigator();



export const LoggedInMain = () => {
  const [you, set_you] = useState(UserStoreService.getLatestState()!);
  const tabBarRef = useRef<any>();
  const [delivering, set_delivering] = useState<IDelivery[]>([]);

  const [newDeliveryClaimEventTimestamp, setNewDeliveryClaimEventTimestamp] = useState(Date.now());
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState<any>(false);
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();


  useEffect(() => {
    /*
      send position updates for all currently handling deliveries.
      
      1. get user's deliverings
      2. if has current deliverings, request current location
      3. if request granted, start interval for sending periodic location updates
    */
    console.log(`tracking location updates...`);
    let interval;

    !!you && firstValueFrom(DeliveryService.getUserDelivering(you.id))
    .then((response) => {
      if (!response.data.length) {
        return;
      }
      return verifyLocationPermission();
    })
    .then((hasPermission) => {
      if (!hasPermission) {
        return;
      }

      return getCurrentPositionAsync();
    })
    .then((results) => {
      if (!results) {
        return;
      }
      
    });
    
    
    return () => {
      !!interval && clearInterval(interval);
    };
  }, [newDeliveryClaimEventTimestamp]);

  // listen to when new deliveries get claimed
  useEffect(() => {
    const sub = LocalEventsService.DELIVERY_CLAIMED_EVENTS.subscribe({
      next: () => {
        console.log(`Main Screen: new delivery claimed`);
        setNewDeliveryClaimEventTimestamp(Date.now());
      }
    });

    return () => {
      sub?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    registerForPushNotificationsAsync().then(async (expo_token) => {
      console.log(`=======`, `User Expo Push Notifications token:`, expo_token, `=======`);
      await SafeStorageService.storeData(`EXPO_TOKEN`, expo_token);

      const alreadyRegisteredToken = !!you.expo_devices && !!you.expo_devices.length && you.expo_devices.some(device => device.token === expo_token);
      console.log({ alreadyRegisteredToken });
      if (alreadyRegisteredToken) {
        return;
      }

      const payload: PlainObject = {
        expo_token: expo_token,
      };
      UsersService.register_expo_device_and_push_token(you.id, payload)
      .subscribe({
        next: (response) => {
          // Alert.alert(response.message || `Push Notifications Enabled!`);
          // sendPushNotification(expo_token);
        },
        error: (error) => {
          const data = error.response.data?.data;
          if (data) {
            if (!data.registered) {
              !!error.response?.data?.message && Alert.alert(error.response?.data?.message);
            }
            else {
              console.log(`----- token already registered -----`);
            }
          }
        },
        complete: () => {},
      });
    });

    // This listener is fired whenever a notification is received while the app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener((new_notification) => {
      console.log(new_notification);
      setNotification(new_notification);
    });

    // This listener is fired whenever a user taps on or interacts with a notification (works when app is foregrounded, backgrounded, or killed)
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log(response);
    });

    const teardown = () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };

    return teardown;
  }, []);

  useEffect(() => {
    UserStoreService.getChangesObs()
    .subscribe({
      next: (you) => {
        console.log(`tabs view:`, { user: !!you });
        set_you(you!);
      }
    });
  }, []);

  const account_is_ready = (
    !!you && 
    !!you.stripe_account_id && 
    !!you.stripe_customer_account_id &&
    !!you.stripe_account_verified
  );

  return (
    Platform.OS === `android` ? (
      <Tab.Navigator screenOptions={{ tabBarStyle: { height: StylesConstants.TABNAV_HEIGHT } }}>
        <Tab.Screen name="Home" component={UserHomeScreen} options={tabBarOptions.home} />
        { account_is_ready &&
          <>
            <Tab.Screen name="Deliveries" component={UserDeliveriesScreen} options={tabBarOptions.deliveries} />
            <Tab.Screen name="Delivering" component={UserDeliveringScreen} options={tabBarOptions.delivering} />
            <Tab.Screen name="Search" component={UserSearchScreen} options={tabBarOptions.search} />
          </>
        }
        <Tab.Screen name="Settings" component={UserSettingsScreen} options={tabBarOptions.settings} />
      </Tab.Navigator>
    ) : (
      <Tab.Navigator screenOptions={{  }}>
        <Tab.Screen name="Home" component={UserHomeScreen} options={tabBarOptions.home} />
        { account_is_ready &&
          <>
            <Tab.Screen name="Deliveries" component={UserDeliveriesScreen} options={tabBarOptions.deliveries} />
            <Tab.Screen name="Delivering" component={UserDeliveringScreen} options={tabBarOptions.delivering} />
            <Tab.Screen name="Search" component={UserSearchScreen} options={tabBarOptions.search} />
          </>
        }
        <Tab.Screen name="Settings" component={UserSettingsScreen} options={tabBarOptions.settings} />
      </Tab.Navigator>
    )
  );
};

const tabBarOptions: {
  [key:string]: BottomTabNavigationOptions,
} = {
  home: {
    tabBarIcon: (params) => <Ionicons name="md-home" size={24} color={params.focused ? StylesConstants.APP_PRIMARY_COLOR : StylesConstants.MEDIUM_GREY} />,
    tabBarActiveTintColor: StylesConstants.APP_PRIMARY_COLOR,
    headerShown: false
  },
  deliveries: {
    tabBarIcon: (params) => <MaterialCommunityIcons name="package-variant-closed" size={24} color={params.focused ? StylesConstants.APP_PRIMARY_COLOR : StylesConstants.MEDIUM_GREY} />,
    tabBarActiveTintColor: StylesConstants.APP_PRIMARY_COLOR,
    headerShown: false
  },
  delivering: {
    tabBarIcon: (params) => <MaterialCommunityIcons name="truck-delivery" size={24} color={params.focused ? StylesConstants.APP_PRIMARY_COLOR : StylesConstants.MEDIUM_GREY} />,
    tabBarActiveTintColor: StylesConstants.APP_PRIMARY_COLOR,
    headerShown: false
  },
  search: {
    tabBarIcon: (params) => <Ionicons name="md-search-circle-sharp" size={24} color={params.focused ? StylesConstants.APP_PRIMARY_COLOR : StylesConstants.MEDIUM_GREY} />,
    tabBarActiveTintColor: StylesConstants.APP_PRIMARY_COLOR,
    headerShown: false
  },
  settings: {
    tabBarIcon: (params) => <Ionicons name="md-settings" size={24} color={params.focused ? StylesConstants.APP_PRIMARY_COLOR : StylesConstants.MEDIUM_GREY} />,
    tabBarActiveTintColor: StylesConstants.APP_PRIMARY_COLOR,
    headerShown: false
  },
};




async function sendPushNotification(expoPushToken) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: 'Original Title',
    body: 'And here is the body!',
    data: { someData: 'goes here' },
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  }).then((response) => {
    console.log(`======= notifications response received`, response);
  });
}

async function registerForPushNotificationsAsync() {
  let token;

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log(`expo token:`, {token});
  } 
  // else {
  //   alert('Allow Push Notifications?');
  // }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}

async function verifyLocationPermission(): Promise<boolean> {
  const permissionResult = await requestForegroundPermissionsAsync();
  if (permissionResult.status === PermissionStatus.GRANTED) {
    return true;
  }

  if (permissionResult.canAskAgain && permissionResult.status === PermissionStatus.UNDETERMINED) {
    // keep asking for location until user says yes or no
    return verifyLocationPermission();
  }

  return false;
};