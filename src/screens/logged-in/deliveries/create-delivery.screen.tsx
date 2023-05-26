import { Alert, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DeliveryService } from '../../../services/delivery.service';
import { DeliveryForm } from '../../../components/delivery/delivery-form.component';
import { IFormSubmitEvent } from '../../../interfaces/_common.interface';
import { StylesConstants } from '../../../services/styles.constants';
import { PageHeaderBack } from '../../../components/page-headers/page-header-back.component';
import React, { useState } from 'react';
import { finalize } from 'rxjs';
import { LocalEventsService } from '../../../services/local-events.service';



export function CreateDeliveryScreen(props) {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const handleCreateDelivery = async (params: IFormSubmitEvent) => {
    setIsLoading(true);
    DeliveryService.create_delivery(params.formData)
    .pipe(finalize(() => { setIsLoading(false); }))
    .subscribe({
      next: (response: any) => {
        Alert.alert(`Delivery created successfully!`);
        navigation.goBack();
        LocalEventsService.DELIVERY_CREATED_STREAM.next(response.data);
      },
      error: (error: any) => {
        if (error.response && error.response.data.message) {
          Alert.alert(error.response.data.message);
        }
      },
    });
  };

  return (
    <SafeAreaView style={StylesConstants.COMMON_STYLES.safeAreaViewContainer}>
      <PageHeaderBack header="Create a Delivery" />

      <DeliveryForm { ...props } isLoading={isLoading} onSubmit={handleCreateDelivery} />
    </SafeAreaView>
  );
}