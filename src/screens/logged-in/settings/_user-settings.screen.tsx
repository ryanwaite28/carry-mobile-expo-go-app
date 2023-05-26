import { StyleSheet, Text, View, TouchableOpacity, Image, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import { UsersService } from '../../../services/users.service';
import { UserStoreService } from '../../../services/user-store.service';
import { PlainObject } from '../../../interfaces/json-object.interface';
import { ScrollView } from 'react-native-gesture-handler';
import { getUserFullName } from '../../../utils/common.utils';
import { StylesConstants } from '../../../services/styles.constants';
import { createNativeStackNavigator, NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { SettingsMainScreen } from './settings-main.screen';





const Stack = createNativeStackNavigator();

export function UserSettingsScreen() {
  return (
    <Stack.Navigator initialRouteName="SettingsMain">
      <Stack.Screen name="SettingsMain" options={screenOptions.main} component={SettingsMainScreen} />

      
    </Stack.Navigator>
  );
}

const screenOptions: {
  [key:string]: NativeStackNavigationOptions,
} = {
  main: {
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
