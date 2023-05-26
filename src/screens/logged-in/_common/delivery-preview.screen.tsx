import { Modal, StyleSheet, Alert, View, TouchableOpacity, Image, FlatList, SafeAreaView, Dimensions, RefreshControl, ActivityIndicator, Text, ScrollView } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { IDelivery } from '../../../interfaces/deliverme.interface';
import { StylesConstants } from '../../../services/styles.constants';
import { PageHeader } from '../../../components/page-headers/page-header.component';
import { PageHeaderBack } from '../../../components/page-headers/page-header-back.component';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { add_on_stripe_processing_fee, dateTimeTransform, formatStripeAmount, getDeliveryStatus, timeAgoTransform } from '../../../utils/common.utils';
import { LoadingScreenComponent } from '../../../components/loading-screen.component';
import { DeliveryService } from '../../../services/delivery.service';
import { UserStoreService } from '../../../services/user-store.service';
import { finalize } from 'rxjs';
import { requestForegroundPermissionsAsync, PermissionStatus } from 'expo-location';
import { LocalEventsService } from '../../../services/local-events.service';




export function DeliveryPreviewScreen(props) {
  const you = UserStoreService.getLatestState()!
  const delivery: IDelivery = props.route.params.delivery;
  const navigation = useNavigation<any>();

  const datetime = dateTimeTransform(delivery.date_created);
  const timeAgo = timeAgoTransform(delivery.date_created);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastRendered, setLastRendered] = useState<number>(Date.now());

  const dateText = `${datetime} (${timeAgo})`;
  const status = getDeliveryStatus(delivery, you);
  const statusTextStyle = delivery.completed
    ? styles.textDeliveryCompleted
    : delivery.carrier_id
      ? styles.textDeliveryInProgress
      : styles.textDeliveryOpoen;

  const chargeFeeDataWithSub = add_on_stripe_processing_fee(delivery.payout, true);
  const chargeFeeDataWithoutSub = add_on_stripe_processing_fee(delivery.payout, false);

  const requestLocationBeforeAssign = () => {
    // require location access to take deliveries
    verifyLocationPermission().then((hasPermission) => {
      if (!hasPermission) {
        return Alert.alert(`Location permission is required in order to claim delivery listings.`);
      }
      else {
        assignDelivery();
      }
    });
  };

  const assignDelivery = () => {
    setIsLoading(true);
    DeliveryService.assignDelivery(you.id, delivery.id)
    .pipe(finalize(() => { setIsLoading(false); }))
    .subscribe({
      next: (response) => {
        !!response.message && Alert.alert(response.message);
        props.onRefresh && props.onRefresh();
        navigation.goBack();
        LocalEventsService.DELIVERY_CLAIMED_STREAM.next(response.data);
      },
      error: (error) => {
        error.response?.data?.message && Alert.alert(error.response?.data?.message);
      }
    });
  };

  if (isLoading) {
    return (
      <LoadingScreenComponent />
    );
  }

  return (
    <SafeAreaView style={StylesConstants.COMMON_STYLES.safeAreaViewContainer}>
      <PageHeader header="Search List View">
        <TouchableOpacity style={{ marginLeft: 25 }} onPress={() => { navigation.goBack(); }}>
          <Ionicons name="md-return-up-back-outline" size={24} color="black" />
        </TouchableOpacity>
      </PageHeader>

      <ScrollView style={[StylesConstants.COMMON_STYLES.bgGrey, { padding: 10 }]}>
        <View style={[StylesConstants.COMMON_STYLES.infoBoxZeroPaddingMargin, { padding: 15, marginBottom: 15 }]}>
          <Text style={{padding: 15, fontSize: 36}}>Info</Text>
          <View style={{ marginTop: 25 }}>
            <Text style={styles.title}>{ delivery.title }</Text>
            <Text style={StylesConstants.COMMON_STYLES.textWrap}>{ delivery.description }</Text>
            <Text style={[statusTextStyle, { marginVertical: 15 }]}>{ status.display }</Text>
          </View>
          <Text style={styles.headerText}>Date Created</Text>
          <Text style={{ marginBottom: 10 }}>{ dateText }</Text>

          <View style={{ marginBottom: 15 }}>
            <Text style={styles.headerText}>Info</Text>
            <Text>Size: { delivery.size }</Text>
            <Text>Weight: { delivery.weight } lbs</Text>
            <Text>Urgent: { delivery.urgent ? 'yes' : 'no' }</Text>
            <Text>Payout (With Subscription): ${ formatStripeAmount(chargeFeeDataWithSub.total) }</Text>
            <Text>Payout (Without Subscription): ${ formatStripeAmount(chargeFeeDataWithoutSub.total) }</Text>
            <Text>Penalty: ${ delivery.penalty }</Text>
            <Text>Distance: { delivery.distance_miles.toFixed(2) } Miles</Text>
          </View>

          <View style={{ marginBottom: 15 }}>
            <Text style={styles.headerText}>From</Text>
            <Text>Location: { delivery.from_city }, { delivery.from_state }</Text>
          </View>

          <View style={{ marginBottom: 15 }}>
            <Text style={styles.headerText}>To</Text>
            <Text>Location: { delivery.to_city }, { delivery.to_state }</Text>
          </View>

          <TouchableOpacity style={[StylesConstants.COMMON_STYLES.btnSecondaryFullWidth, { marginTop: 10 }]} onPress={requestLocationBeforeAssign}>
            <Text style={StylesConstants.COMMON_STYLES.btnTextWhite}>
              Claim
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerText: {
    fontSize: 24,
    // marginBottom: 4,
  },
  usernameText: {
    fontSize: 16,
    marginBottom: 12,
    color: StylesConstants.MEDIUM_GREY
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  description: {
    
  },
  otherInfo: {
    fontSize: 12,
    marginTop: 10,
  },

  textDeliveryCompleted: {
    padding: 4,
    color: `white`,
    backgroundColor: `green`,
    borderColor: `green`,
    borderWidth: 0.5,
    borderRadius: 4,
    overflow: 'hidden',
  },
  textDeliveryInProgress: {
    padding: 4,
    color: `black`,
    backgroundColor: `yellow`,
    borderColor: `gold`,
    borderWidth: 0.5,
    borderRadius: 4,
    overflow: 'hidden',
  },
  textDeliveryOpoen: {
    padding: 4,
    color: `white`,
    backgroundColor: `blue`,
    borderColor: `blue`,
    borderWidth: 0.5,
    borderRadius: 4,
    overflow: 'hidden',
  },
});

async function verifyLocationPermission(): Promise<boolean> {
  const permissionResult = await requestForegroundPermissionsAsync();
  return permissionResult.granted;
  // if (permissionResult.status === PermissionStatus.GRANTED) {
  //   return true;
  // }

  // if (permissionResult.canAskAgain && permissionResult.status === PermissionStatus.UNDETERMINED) {
  //   // keep asking for location until user says yes or no
  //   return verifyLocationPermission();
  // }

  // return false;
};
