import { IDelivery, IDeliveryDispute } from "../../interfaces/deliverme.interface";
import { createNativeStackNavigator, NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { DisputeMainComponent } from "./dispute/dispute-main.component";
import { DisputeLogsComponent } from "./dispute/dispute-logs.component";
import { DisputeCustomerSupportMessagesComponent } from "./dispute/dispute-cs-messages.component";
import { DisputeSettlementOffersComponent } from "./dispute/dispute-settlement-offers.component";




const Stack = createNativeStackNavigator();

export function DeliveryDisputeComponent (props) {
  const delivery: IDelivery = props.route.params.delivery;



  return (
    <Stack.Navigator initialRouteName="DisputeMain">
      <Stack.Screen name="DisputeMain" options={screenOptions.main}>
        {(props) => <DisputeMainComponent {...props} delivery={delivery} header="Dispute" /> }
      </Stack.Screen>

      <Stack.Screen name="DisputeLogs" options={screenOptions.main}>
        {(props) => <DisputeLogsComponent {...props} delivery={delivery} header="Logs" /> }
      </Stack.Screen>

      <Stack.Screen name="DisputeCustomerSupportMessages" options={screenOptions.main}>
        {(props) => <DisputeCustomerSupportMessagesComponent {...props} delivery={delivery} header="Messages" /> }
      </Stack.Screen>

      <Stack.Screen name="DisputeSettlementOffers" options={screenOptions.main}>
        {(props) => <DisputeSettlementOffersComponent {...props} delivery={delivery} header="Settlement Offers" /> }
      </Stack.Screen>
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
