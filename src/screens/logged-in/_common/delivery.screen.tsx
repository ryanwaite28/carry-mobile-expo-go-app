import {  } from 'react-native';
import { DeliveryComponent } from '../../../components/delivery/delivery.component';
import { IDelivery } from '../../../interfaces/deliverme.interface';


export function DeliveryScreen(props) {
  const delivery: IDelivery = props.route.params.delivery;

  return (
    <DeliveryComponent delivery={delivery} />
  );
}