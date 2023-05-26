import { createNativeStackNavigator, NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { DeliveriesMainScreen } from './deliveries.screen';
import { CreateDeliveryScreen } from './create-delivery.screen';
import { DeliveryScreen } from '../_common/delivery.screen';
import { DeliveryTrackingUpdatesComponent } from '../../../components/delivery/delivery-tracking-updates.component';
import { DeliveryMessagesComponent } from '../../../components/delivery/delivery-messages.component';
import { DeliveryVerificationsComponent } from '../../../components/delivery/delivery-verification.component';
import { DeliveryDisputeComponent } from '../../../components/delivery/delivery-dispute.component';




const Stack = createNativeStackNavigator();

export function UserDeliveriesScreen() {
  return (
    <Stack.Navigator initialRouteName="DeliveriesMain">
      <Stack.Screen name="DeliveriesMain" options={screenOptions.main} component={DeliveriesMainScreen} />
      <Stack.Screen name="CreateDelivery" options={screenOptions.createDelivery} component={CreateDeliveryScreen} />

      <Stack.Screen name="DeliveryScreen" options={screenOptions.delivery} component={DeliveryScreen} />
      
      <Stack.Screen name="DeliveryTrackingUpdates" options={screenOptions.delivery} component={DeliveryTrackingUpdatesComponent} />
      <Stack.Screen name="DeliveryMessages" options={screenOptions.delivery} component={DeliveryMessagesComponent} />
      <Stack.Screen name="DeliveryVerifications" options={screenOptions.delivery} component={DeliveryVerificationsComponent} />
      <Stack.Screen name="DeliveryDispute" options={screenOptions.delivery} component={DeliveryDisputeComponent} />
    </Stack.Navigator>
  );
}

const screenOptions: {
  [key:string]: NativeStackNavigationOptions,
} = {
  main: {
    headerShown: false
  },
  createDelivery: {
    headerShown: false
  },
  delivery: {
    headerShown: false
  },
};
