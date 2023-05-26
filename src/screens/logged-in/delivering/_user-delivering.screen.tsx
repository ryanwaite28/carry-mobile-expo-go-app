import { createNativeStackNavigator, NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { DeliveringMainScreen } from './delivering.screen';
import { DeliveryScreen } from '../_common/delivery.screen';
import { DeliveringPastMainScreen } from './delivering-past.screen';
import { DeliveryTrackingUpdatesComponent } from '../../../components/delivery/delivery-tracking-updates.component';
import { DeliveryMessagesComponent } from '../../../components/delivery/delivery-messages.component';
import { DeliveryVerificationsComponent } from '../../../components/delivery/delivery-verification.component';
import { DeliveryDisputeComponent } from '../../../components/delivery/delivery-dispute.component';



const Stack = createNativeStackNavigator();

export function UserDeliveringScreen() {
  return (
    <Stack.Navigator initialRouteName="DeliveringMain">
      <Stack.Screen name="DeliveringMain" options={screenOptions.main} component={DeliveringMainScreen} />
      <Stack.Screen name="DeliveringPast" options={screenOptions.deliveryPast} component={DeliveringPastMainScreen} />

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
  delivery: {
    headerShown: false,
  },
  deliveryPast: {
    headerShown: false
  },
};
