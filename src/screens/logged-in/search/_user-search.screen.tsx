import { StyleSheet, Text, View, TouchableOpacity, Image, FlatList } from 'react-native';
import React from 'react';
import { UsersService } from '../../../services/users.service';
import { UserStoreService } from '../../../services/user-store.service';
import { PlainObject } from '../../../interfaces/json-object.interface';
import { ScrollView } from 'react-native-gesture-handler';
import { getUserFullName } from '../../../utils/common.utils';
import { StylesConstants } from '../../../services/styles.constants';
import { createNativeStackNavigator, NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { SearchMainScreen } from './search-main.screen';
import { SearchListViewScreen } from './search-list-view.screen';
import { DeliveryPreviewScreen } from '../_common/delivery-preview.screen';




const Stack = createNativeStackNavigator();

export function UserSearchScreen() {
  return (
    <Stack.Navigator initialRouteName="SearchMain">
      <Stack.Screen name="SearchMain" options={screenOptions.main} component={SearchMainScreen} />
      <Stack.Screen name="SearchListView" options={screenOptions.main} component={SearchListViewScreen} />

      <Stack.Screen name="DeliveryPreviewScreen" options={screenOptions.delivery} component={DeliveryPreviewScreen} />
    </Stack.Navigator>
  );
}

const screenOptions: {
  [key:string]: NativeStackNavigationOptions,
} = {
  main: {
    headerShown: false
  },
  delivery: {
    headerShown: false
  },
};

