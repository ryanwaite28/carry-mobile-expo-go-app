import React from 'react';
import { StyleSheet } from 'react-native';
import { StylesConstants } from '../../../services/styles.constants';
import { createNativeStackNavigator, NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { HomeMainScreen } from './home-main.screen';
import { NotificationsMainScreen } from './notifications.screen';




const Stack = createNativeStackNavigator();

export function UserHomeScreen() {
  return (
    <Stack.Navigator initialRouteName="HomeMain">
      <Stack.Screen name="HomeMain" options={screenOptions.main} component={HomeMainScreen} />
      <Stack.Screen name="NotificationsMain" options={screenOptions.notifications} component={NotificationsMainScreen} />
    </Stack.Navigator>
  );
}

const screenOptions: {
  [key:string]: NativeStackNavigationOptions,
} = {
  main: {
    headerShown: false
  },
  notifications: {
    headerShown: false
  },
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  userIcon: {
    width: 150, 
    height: 150,
    marginBottom: 24,
  },

  headerText: {
    fontSize: 36,
    // marginBottom: 4,
  },
  usernameText: {
    fontSize: 24,
    marginBottom: 12,
    color: StylesConstants.APP_SECONDARY_COLOR
  },

  item: {
    backgroundColor: StylesConstants.LIGHT_GREY,
    padding: 10,
    marginVertical: 4,
    // marginHorizontal: 16,
  },
  itemTitle: {
    fontSize: 12,
  },
});
