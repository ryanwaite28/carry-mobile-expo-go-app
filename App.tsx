import { StatusBar } from 'expo-status-bar';
import React, { useContext } from 'react';
import { LinkingOptions, NavigationContainer } from '@react-navigation/native';
import { LoggedOutStack } from './src/screens/logged-out/_main.screen';
import { LoggedInMain } from './src/screens/logged-in/_main.screen';
import { useEffect, useState, useRef } from 'react';
import { Text, View, StatusBar as Statusbar } from 'react-native';
import { UsersService } from './src/services/users.service';
import { filter, mergeMap, take } from 'rxjs';
import { AppGlobalState } from './src/services/app.state';
import { UserStoreService } from './src/services/user-store.service';
import { LogBox } from "react-native";
import { LoadingScreenComponent } from './src/components/loading-screen.component';
import { SocketEventsService } from './src/services/socket-events.service';
import { MODERN_APPS } from './src/enums/all.enums';
import { COMMON_EVENT_TYPES, DELIVERME_EVENT_TYPES } from './src/enums/modern.enums';
import * as Linking from 'expo-linking';
import { StripeProvider } from '@stripe/stripe-react-native';
import { Platform } from 'react-native';
import { setNotificationHandler } from 'expo-notifications';
import { AppGlobalsContext, AppGlobalsContextProvider } from './src/store/context/global.store';



setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowAlert: true,
    }
  }
});


console.log({ NODE_ENV: process.env.NODE_ENV });



export const prefix = Linking.createURL('/');
console.log(`app platform os`, { Platform: JSON.stringify(Platform) });
console.log(`app linking prefix`, { prefix });


LogBox.ignoreAllLogs();
// LogBox.ignoreLogs();



console.log(`status bar height:`, Statusbar.currentHeight);

const linking: LinkingOptions<ReactNavigation.RootParamList> = {
  prefixes: [prefix, 'carry://'],
  config: {
    screens: {
      Home: `home`,
      Deliveries: `deliveries`,
      Delivering: `delivering`,
      Search: `search`,
      Settings: `settings`,

      NotFound: '*',
    }
  },
};



export default function App() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSignedIn, setSignedIn] = useState<boolean>(false);
  const [googleKeyLoaded, setGoogleKeyLoaded] = useState<boolean>(false);
  const [stripePkLoaded, setStripePkLoaded] = useState<boolean>(false);



  const appContext = useContext(AppGlobalsContext);

  

  useEffect(() => {
    SocketEventsService.isReady.subscribe({
      next: () => {
        console.log(`===== SocketEventsService =====`);
        SocketEventsService.registerAppEventListenerStreams(MODERN_APPS.COMMON, COMMON_EVENT_TYPES);
        SocketEventsService.registerAppEventListenerStreams(MODERN_APPS.DELIVERME, DELIVERME_EVENT_TYPES);
      }
    });

    SocketEventsService.init();
  }, [])

  useEffect(() => {
    UsersService.loadGoogleMaps().pipe(
      mergeMap((response) => {
        return UsersService.checkUserSession();
      })
    )
    .subscribe({
      next: (you) => {
        setGoogleKeyLoaded(true);
        appContext.SET_GOOGLE_API_KEY(AppGlobalState.GOOGLE_API_KEY);
      }
    });
  }, []);

  useEffect(() => {
    UsersService.loadStripe()
      .subscribe({
        next: (response) => {
          setStripePkLoaded(true);
          appContext.SET_STRIPE_PUBLIC_KEY(AppGlobalState.STRIPE_PUBLIC_KEY);
        }
      });
  }, []);

  useEffect(() => {
    UserStoreService.getChangesObs()
    .subscribe({
      next: (you) => {
        console.log(`setting signed in state:`, { user: !!you });
        setSignedIn(!!you);
        setIsLoading(false);
      }
    });
  }, []);


  const url = Linking.useURL();

  console.log(`linking url:`, { url });

  if (url) {
    const { hostname, path, queryParams } = Linking.parse(url);

    console.log(
      `Linked to app with hostname: ${hostname}, path: ${path} and data: ${JSON.stringify(
        queryParams
      )}`
    );
  }

  Linking.addEventListener(`url`, (ev) => {
    console.log(`linking ev:`, { ev }, Date.now());
    // forceUpdate();
  });



  if (isLoading) {
    return (
      <LoadingScreenComponent />
    );
  }
  if (!AppGlobalState.STRIPE_PUBLIC_KEY) {
    console.log(`stripe still loading ------------------------`);
    return (
      <LoadingScreenComponent />
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <AppGlobalsContextProvider>
        <StripeProvider publishableKey={AppGlobalState.STRIPE_PUBLIC_KEY}>
          <NavigationContainer linking={linking} fallback={<Text>Loading...</Text>}>
            { isSignedIn ? <LoggedInMain /> : <LoggedOutStack /> }
          </NavigationContainer>
        </StripeProvider>
      </AppGlobalsContextProvider>
    </View>
  );
}


