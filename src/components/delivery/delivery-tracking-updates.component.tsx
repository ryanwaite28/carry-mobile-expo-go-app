import { SafeAreaView, View, FlatList, RefreshControl, ActivityIndicator, Text, TouchableOpacity, Modal, ScrollView, Image, Alert, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { IDelivery, IDeliveryTrackingUpdate } from '../../interfaces/deliverme.interface';
import { StylesConstants } from '../../services/styles.constants';
import { PageHeader } from '../../components/page-headers/page-header.component';
import { PageHeaderBack } from '../../components/page-headers/page-header-back.component';
import React, { useEffect, useRef, useState } from 'react';
import { DeliveryService } from '../../services/delivery.service';
import { UserStoreService } from '../../services/user-store.service';
import { Ionicons } from '@expo/vector-icons';
import { dateTimeTransform, timeAgoTransform } from '../../utils/common.utils';
import { UsersService } from '../../services/users.service';
import { TextAreaInput } from '../inputs/textarea.component';
import {
  useBackgroundPermissions,
  useForegroundPermissions,
  startLocationUpdatesAsync,
  hasServicesEnabledAsync,
  hasStartedGeofencingAsync,
  hasStartedLocationUpdatesAsync,
  LocationObject,
  requestBackgroundPermissionsAsync,
  requestForegroundPermissionsAsync,
  reverseGeocodeAsync,
  getCurrentPositionAsync,
  PermissionStatus
} from 'expo-location';
import { LoadingScreenComponent } from '../loading-screen.component';
import { ImageUploadModal } from "../image-upload-modal.component";
import { IFormSubmitEvent } from '../../interfaces/_common.interface';
import { finalize } from 'rxjs';



const TrackingUpdate = (props) => {
  const tracking_update: IDeliveryTrackingUpdate = props.tracking_update;
  return (
    <View style={[StylesConstants.COMMON_STYLES.infoBoxZeroPaddingMargin, { margin: 10, padding: 15 }]}>
      <Text style={{ fontSize: 24 }}>{ tracking_update.message }</Text>
      <Text style={{ fontSize: 12, marginVertical: 10 }}>{ dateTimeTransform(tracking_update.created_at) + ' (' + timeAgoTransform(tracking_update.created_at) + ')' }</Text>
      <Text style={{ fontSize: 12, marginVertical: 10, }}>{ tracking_update.location }</Text>

      {tracking_update.icon_link && <Image style={{ width: 200, height: 200, marginTop: 15 }} source={{ uri: tracking_update.icon_link }} />}
    </View>
  );
};

export function DeliveryTrackingUpdatesComponent(props) {
  const delivery: IDelivery = props.route.params.delivery;
  const [locationPermissionInfo, requestForegroundPermissions] = useForegroundPermissions();
  
  const listElmRef = useRef(null);
  const [you, set_you] = useState(UserStoreService.getLatestState()!);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [is_refreshing, set_is_refreshing] = useState<boolean>(false);
  const [add_update_modal_visible, set_add_update_modal_visible] = useState<boolean>(false);
  const [new_update_message, set_new_update_message] = useState<string>('');
  const [image, set_image] = useState("");

  const [add_image_modal_visible, set_add_image_modal_visible] = useState(false);

  const [tracking_updates, set_tracking_updates] = useState<IDeliveryTrackingUpdate[]>(delivery.deliverme_delivery_tracking_updates! || []);
  let min_id: number | undefined = tracking_updates[tracking_updates.length - 1]?.id;

  const isCarrier = !!delivery.carrier_id && you.id === delivery.carrier_id;

  const onRefresh = () => {
    set_is_refreshing(true);
    min_id = undefined;
    DeliveryService.get_delivery_by_id(delivery.id).subscribe({
      next: (response) => {
        Object.assign(delivery, response.data);
        set_tracking_updates(delivery.deliverme_delivery_tracking_updates!);
        set_is_refreshing(false);
      },
      error: (error) => {
        error.response?.data?.message && Alert.alert(error.response?.data?.message);
      }
    });
  }

  const onEndReached = () => {
    // if (min_id && min_id <= 1) {
    //   return;
    // }
    // setIsLoadingMore(true);
    // DeliveryService.getUserDeliveries(you.id, min_id)
    // .pipe(finalize(() => { setIsLoadingMore(false); }))
    // .subscribe({
    //   next: (response) => {
    //     set_deliveries([...deliveries, ...response.data]);
    //   }
    // });
  };

  const verifyLocationPermission = async () => {
    if (locationPermissionInfo?.status !== PermissionStatus.GRANTED) {
      // Ask the user for the permission to access the camera
      const permissionResult = await requestForegroundPermissions();
      console.log({ permissionResult });
      if (permissionResult.granted === false) {
        Alert.alert("Location is required", "You've refused to allow this app to access your location");
        return false;
      }
      else {
        return true;
      }
    }

    return true;
  };

  const preparePayload = async () => {
    const hasPermission = await verifyLocationPermission();
    if (!hasPermission) {
      return;
    }

    if (!new_update_message) {
      Alert.alert(`Message is required.`);
      return;
    }

    setIsLoading(true);
    const location = await getCurrentPositionAsync({});

    const payload = {
      message: new_update_message,
      carrier_lat: location.coords.latitude,
      carrier_lng: location.coords.longitude,
    };
    const formData = new FormData();
    formData.append(`payload`, JSON.stringify({...payload}));
    if (image) {
      // https://stackoverflow.com/questions/42521679/how-can-i-upload-a-photo-with-expo
      let localUri = image;
      let filename = localUri.split('/').pop()!;

      // Infer the type of the image
      let match = /\.(\w+)$/.exec(filename);
      let filetype = match ? `image/${match[1]}` : `image`;
      formData.append(`tracking_update_image`, {
        name: filename,
        type: filetype,
        uri: Platform.OS === "android" ? image : image.replace("file://", "")
      } as any);
    }
    
    const params: IFormSubmitEvent = {
      formData,
      payload
    };

    console.log({ payload });
    
    return params;
  };

  const sendNewTrackingUpdate = async () => {
    const params = await preparePayload();
    if (!params) {
      return;
    }
    
    setIsLoading(true);
    DeliveryService.createTrackingUpdate(you.id, delivery.id, params?.formData)
    .pipe(finalize(() => { setIsLoading(false); }))
    .subscribe({
      next: (response) => {
        Alert.alert(response.message!);
        set_new_update_message('');
        set_image('');
        onRefresh();
        set_add_update_modal_visible(false);
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
      <PageHeaderBack header="Tracking Updates">
          {
            isCarrier && !delivery.completed && !delivery.datetime_delivered && (
              <TouchableOpacity style={{ marginRight: 25 }} onPress={() => { set_add_update_modal_visible(true); }}>
                <Ionicons name="md-add-circle-sharp" size={24} color="black" />
              </TouchableOpacity>
            )
          }
      </PageHeaderBack>

      <View style={[StylesConstants.COMMON_STYLES.bgGrey, { justifyContent: `space-between` }]}>
        
        <FlatList
          ref={listElmRef}
          refreshControl={<RefreshControl refreshing={is_refreshing} onRefresh={onRefresh} />}
          data={tracking_updates}
          keyExtractor={tracking_update => tracking_update.id.toString()}
          renderItem={(item) => <TrackingUpdate tracking_update={item.item} />}
          ItemSeparatorComponent={() => <></>}
          ListFooterComponent={<ActivityIndicator animating={isLoadingMore} />}
          onEndReached={onEndReached}
          ListEmptyComponent={
            <View style={[StylesConstants.COMMON_STYLES.flexCenter, { height: 250 }]}>
              <Text style={{ color: StylesConstants.MEDIUM_GREY }}>None</Text>
            </View>
          }
        />

        <Modal visible={add_update_modal_visible} animationType="slide">
          <SafeAreaView style={StylesConstants.COMMON_STYLES.safeAreaViewContainer}>
            <PageHeader header="Add Tracking Update">
              <TouchableOpacity style={{ marginLeft: 25 }} onPress={() => { set_add_update_modal_visible(false); }}>
                <Ionicons name="md-return-up-back-outline" size={24} color="black" />
              </TouchableOpacity>
            </PageHeader>

            <ScrollView style={[StylesConstants.COMMON_STYLES.bgGrey, { padding: 10 }]}>
              <View style={[StylesConstants.COMMON_STYLES.infoBoxZeroPaddingMargin, { padding: 15 }]}>
                <TextAreaInput
                  placeholder="Enter New Update Message"
                  label="Message"
                  required={true}
                  numberOfLines={5}
                  value={new_update_message}
                  onChange={(value) => set_new_update_message(value)} />

                
                {
                  !image && (
                    <>
                      <TouchableOpacity style={StylesConstants.COMMON_STYLES.btnSecondaryFullWidth} onPress={() => set_add_image_modal_visible(true)}>
                        <Text style={StylesConstants.COMMON_STYLES.btnTextWhite}>Add Picture</Text>
                      </TouchableOpacity>

                      <ImageUploadModal
                        header="Upload Tracking Update Picture"
                        visible={add_image_modal_visible}
                        set_visible={set_add_image_modal_visible}
                        onSubmit={(imageInfo) => { set_image(imageInfo.uri); }}
                      />
                    </>
                  )
                }
                {
                  !!image && (
                    <TouchableOpacity style={StylesConstants.COMMON_STYLES.btnSecondaryFullWidth} onPress={() => set_image("")}>
                      <Text style={StylesConstants.COMMON_STYLES.btnTextWhite}>Clear Image</Text>
                    </TouchableOpacity>
                  )
                }
                {image && <Image style={{ width: 200, height: 200, marginTop: 15 }} source={{ uri: image }} />}

                <TouchableOpacity style={[StylesConstants.COMMON_STYLES.btnSecondaryFullWidth, { marginTop: 10 }]} onPress={sendNewTrackingUpdate}>
                  <Text style={StylesConstants.COMMON_STYLES.btnTextWhite}>
                    Submit
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </SafeAreaView>
        </Modal>

      </View>
    </SafeAreaView>
  );
}