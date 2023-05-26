import { SafeAreaView, StyleSheet, Image, Text, View, TouchableOpacity, Modal, Alert, RefreshControl, Platform } from "react-native";
import { IDelivery } from "../../interfaces/deliverme.interface";
import { disputeTextStyles, StylesConstants } from "../../services/styles.constants";
import { PageHeader } from '../../components/page-headers/page-header.component';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from "react";
import { DeliveryForm } from '../../components/delivery/delivery-form.component';
import { IFormSubmitEvent } from "../../interfaces/_common.interface";
import { DeliveryService } from "../../services/delivery.service";
import { ScrollView } from "react-native-gesture-handler";
import { UserStoreService } from "../../services/user-store.service";
import { add_on_stripe_processing_fee, dateTimeCompareTransform, dateTimeTransform, formatStripeAmount, getDeliveryStatus, getUserFullName, getUserIcon, timeAgoTransform } from "../../utils/common.utils";
import { finalize } from "rxjs";
import { LoadingScreenComponent } from '../loading-screen.component';
import { ImageUploadModal } from "../image-upload-modal.component";
import { SignatureCaptureModal } from "../signature-capture-modal.component";
import { CommonModal } from "../modal.component";
import { DeliveryHelpGuideComponent } from "../info/delivery-help-guide.component";
import { CommonTextInput } from '../inputs/textinput.component';
import { TextAreaInput } from '../inputs/textarea.component';
import { DeliveryDisputeStatus } from "../../enums/modern.enums";



export function DeliveryComponent (props) {
  // const delivery: IDelivery = props.delivery;
  const navigation = useNavigation<any>();

  const [you, set_you] = useState(UserStoreService.getLatestState()!);
  const [delivery, set_delivery] = useState<IDelivery>(props.delivery);
  const datetime = dateTimeTransform(delivery.date_created);
  const timeAgo = timeAgoTransform(delivery.date_created);
  const dateText = `${datetime} (${timeAgo})`;
  const status = getDeliveryStatus(delivery, you);
  const statusTextStyle = delivery.completed
    ? styles.textDeliveryCompleted
    : delivery.carrier_id
      ? styles.textDeliveryInProgress
      : styles.textDeliveryOpoen;


  const isOwner = you.id === delivery.owner_id;
  const isCarrier = !!delivery.carrier_id && you.id === delivery.carrier_id;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [is_refreshing, set_is_refreshing] = useState<boolean>(false);
  const [lastRendered, setLastRendered] = useState<number>(Date.now());
  const [modal_showing, set_modal_showing] = useState(false);

  // delivery status updates
  const [delivered_image_modal_visible, set_delivered_image_modal_visible] = useState(false);
  const [from_id_image_modal_visible, set_from_id_image_modal_visible] = useState(false);
  const [from_sig_image_modal_visible, set_from_sig_image_modal_visible] = useState(false);
  const [to_id_image_modal_visible, set_to_id_image_modal_visible] = useState(false);
  const [to_sig_image_modal_visible, set_to_sig_image_modal_visible] = useState(false);

  // open dispute
  const [open_dispute_modal_visible, set_open_dispute_modal_visible] = useState(false);
  const [help_guide_modal_visible, set_help_guide_modal_visible] = useState(false);
  
  const [dispute_title, set_dispute_title] = useState("");
  const [dispute_details, set_dispute_details] = useState( "");
  const [dispute_compensation, set_dispute_compensation] = useState<number>(delivery?.penalty);
  const [dispute_image, set_dispute_image] = useState<string>("");
  const [add_dispute_image_modal_visible, set_add_dispute_image_modal_visible] = useState<boolean>(false);

  const chargeFeeDataWithSub = add_on_stripe_processing_fee(delivery.payout, true);
  const chargeFeeDataWithoutSub = add_on_stripe_processing_fee(delivery.payout, false);
  


  /* Handlers */

  const goBackHandler = () => {
    navigation.goBack();
  };

  const openDeliveryEditor = () => {
    console.log(`open editor clicked`);
    if (delivery.carrier_id) {
      Alert.alert(`Delivery cannot be updated while it is assigned to a carrier.`);
      return;
    }
    set_modal_showing(true);
  };
  
  const onDelete = () => {
    console.log(`on delete clicked`);
    
  };

  const handleEditDelivery = async (params: IFormSubmitEvent) => {
    setIsLoading(true);
    DeliveryService.update_delivery(params.formData, delivery.id)
    .pipe(finalize(() => { setIsLoading(false); }))
    .subscribe({
      next: (response: any) => {
        Alert.alert(`Delivery edited successfully!`);
        set_delivery(response.data!.delivery);
        set_modal_showing(false);
      },
      error: (error: any) => {
        if (error.response && error.response.data.message) {
          Alert.alert(error.response.data.message);
        }
      },
    });
  };

  const unassignDelivery = () => {
    setIsLoading(true);
    DeliveryService.unassignDelivery(you.id, delivery.id)
    .pipe(finalize(() => { setIsLoading(false); }))
    .subscribe({
      next: (response) => {
        set_delivery(response.data!.delivery);
        setLastRendered(Date.now());
        props.onRefresh && props.onRefresh();
        navigation.goBack();
      },
      error: (error) => {
        error.response?.data?.message && Alert.alert(error.response?.data?.message);
      }
    });
  };

  const markAsPickedUp = () => {
    setIsLoading(true);
    DeliveryService.markDeliveryAsPickedUp(you.id, delivery.id)
    .pipe(finalize(() => { setIsLoading(false); }))
    .subscribe({
      next: (response) => {
        set_delivery(response.data!.delivery);
        setLastRendered(Date.now());
      },
      error: (error) => {
        error.response?.data?.message && Alert.alert(error.response?.data?.message);
      }
    });
  };

  const markAsDroppedOff = () => {
    setIsLoading(true);
    DeliveryService.markDeliveryAsDroppedOff(you.id, delivery.id)
    .pipe(finalize(() => { setIsLoading(false); }))
    .subscribe({
      next: (response) => {
        set_delivery(response.data!.delivery);
        setLastRendered(Date.now());
      },
      error: (error) => {
        error.response?.data?.message && Alert.alert(error.response?.data?.message);
      }
    });
  };

  const markAsReturned = () => {
    setIsLoading(true);
    DeliveryService.markDeliveryAsReturned(you.id, delivery.id)
    .pipe(finalize(() => { setIsLoading(false); }))
    .subscribe({
      next: (response) => {
        set_delivery(response.data!.delivery);
        setLastRendered(Date.now());
        navigation.goBack();
      },
      error: (error) => {
        error.response?.data?.message && Alert.alert(error.response?.data?.message);
      }
    });
  };

  const navToPage = (page) => {
    navigation.navigate(page, { delivery });
  };

  const reloadThenNavigate = (page: string) => {
    setIsLoading(true);

    DeliveryService.get_delivery_by_id(delivery.id)
    .pipe(finalize(() => { setIsLoading(false); }))
    .subscribe({
      next: (response) => {
        Object.assign(delivery, response.data);
        navToPage(page);
      },
      error: (error) => {
        error.response?.data?.message && Alert.alert(error.response?.data?.message);
      }
    });
  }

  const uploadDeliveryStatusImage = (context: string, imageInfo) => {
    let formData = new FormData();
    formData.append(`image`, imageInfo);
    console.log(formData);

    // if (Platform.OS === `android`) {
    //   formData = {} as any;
    // }

    setIsLoading(true);

    switch (context) {
      case `delivered_image`: {
        set_delivered_image_modal_visible(false);
        DeliveryService.add_delivered_picture(you.id, delivery.id, formData)
        .pipe(finalize(() => { setIsLoading(false); }))
        .subscribe({
          next: (response) => {
            response.message && Alert.alert(response.message);
            set_delivery(response.data!.delivery);
            setLastRendered(Date.now());
          },
          error: (error) => {
            error.response?.data?.message && Alert.alert(error.response?.data?.message);
          }
        });

        break;
      }
      case `from_id_image`: {
        set_from_id_image_modal_visible(false);
        DeliveryService.add_from_person_id_picture(you.id, delivery.id, formData)
        .pipe(finalize(() => { setIsLoading(false); }))
        .subscribe({
          next: (response) => {
            response.message && Alert.alert(response.message);
            set_delivery(response.data!.delivery);
            setLastRendered(Date.now());
          },
          error: (error) => {
            error.response?.data?.message && Alert.alert(error.response?.data?.message);
          }
        });
        break;
      }
      case `from_sig_image`: {
        set_from_sig_image_modal_visible(false);
        DeliveryService.add_from_person_sig_picture(you.id, delivery.id, formData)
        .pipe(finalize(() => { setIsLoading(false); }))
        .subscribe({
          next: (response) => {
            response.message && Alert.alert(response.message);
            set_delivery(response.data!.delivery);
            setLastRendered(Date.now());
          },
          error: (error) => {
            error.response?.data?.message && Alert.alert(error.response?.data?.message);
          }
        });
        break;
      }
      case `to_id_image`: {
        set_to_id_image_modal_visible(false);
        DeliveryService.add_to_person_id_picture(you.id, delivery.id, formData)
        .pipe(finalize(() => { setIsLoading(false); }))
        .subscribe({
          next: (response) => {
            response.message && Alert.alert(response.message);
            set_delivery(response.data!.delivery);
            setLastRendered(Date.now());
          },
          error: (error) => {
            error.response?.data?.message && Alert.alert(error.response?.data?.message);
          }
        });
        break;
      }
      case `to_sig_image`: {
        set_to_sig_image_modal_visible(false);
        DeliveryService.add_to_person_sig_picture(you.id, delivery.id, formData)
        .pipe(finalize(() => { setIsLoading(false); }))
        .subscribe({
          next: (response) => {
            response.message && Alert.alert(response.message);
            set_delivery(response.data!.delivery);
            setLastRendered(Date.now());
          },
          error: (error) => {
            error.response?.data?.message && Alert.alert(error.response?.data?.message);
          }
        });
        break;
      }
    }
  };

  const onRefreshDelivery = () => {
    set_is_refreshing(true);
    DeliveryService.get_delivery_by_id(delivery.id)
    .pipe(finalize(() => { set_is_refreshing(false); }))
    .subscribe({
      next: (response) => {
        set_delivery(response.data!);
      },
      error: (error) => {
        error.response?.data?.message && Alert.alert(error.response?.data?.message);
      }
    });
  };

  const payCarrier = () => {
    setIsLoading(true);
    DeliveryService.payCarrier(you.id, delivery.id)
    .pipe(finalize(() => { setIsLoading(false); }))
    .subscribe({
      next: (response) => {
        response.message && Alert.alert(response.message);
        set_delivery(response.data!.delivery);
        setLastRendered(Date.now());
      },
      error: (error) => {
        error.response?.data?.message && Alert.alert(error.response?.data?.message);
      }
    });
  };

  const createDeliveryDispute = () => {
    if (!dispute_title) {
      Alert.alert(`Title is required`);
      return;
    }
    if (!dispute_details) {
      Alert.alert(`Details is required`);
      return;
    }
    if (!dispute_compensation) {
      Alert.alert(`Compensation is required`);
      return;
    }

    const formData = new FormData();
    const payload = {
      title: dispute_title,
      details: dispute_details,
      compensation: dispute_compensation,
    };
    formData.append(`payload`, JSON.stringify(payload));
    if (dispute_image) {
      // https://stackoverflow.com/questions/42521679/how-can-i-upload-a-photo-with-expo
      let localUri = dispute_image;
      let filename = localUri.split('/').pop()!;

      // Infer the type of the image
      let match = /\.(\w+)$/.exec(filename);
      let filetype = match ? `image/${match[1]}` : `image`;
      formData.append(`delivery_image`, {
        name: filename,
        type: filetype,
        uri: Platform.OS === "android" ? dispute_image : dispute_image.replace("file://", "")
      } as any);
    }

    setIsLoading(true);
    DeliveryService.create_delivery_dispute(delivery.id, formData)
    .pipe(finalize(() => { setIsLoading(false); }))
    .subscribe({
      next: (response) => {
        response.message && Alert.alert(response.message);
        const new_delivery: IDelivery = { ...delivery, delivery_dispute: response.data };
        set_delivery(new_delivery);
        setLastRendered(Date.now());
      },
      error: (error) => {
        error.response?.data?.message && Alert.alert(error.response?.data?.message);
      }
    });
  };



  const ownerIcon = getUserIcon(delivery.owner!);
  const carrierIcon = !!delivery.carrier ? getUserIcon(delivery.carrier) : null;

  if (isLoading) {
    return (
      <LoadingScreenComponent />
    );
  }

  return (
    <SafeAreaView style={[StylesConstants.COMMON_STYLES.safeAreaViewContainer]}>
      <PageHeader header="Delivery">
        {
          isOwner && !delivery.carrier_id && (
            <TouchableOpacity style={{ marginLeft: 25 }} onPress={onDelete}>
              <MaterialCommunityIcons name="trash-can-outline" size={24} color="black" />
            </TouchableOpacity>
          )
        }

        {
          isOwner && !delivery.carrier_id && (
            <TouchableOpacity style={{ marginLeft: 25 }} onPress={openDeliveryEditor}>
              <MaterialCommunityIcons name="square-edit-outline" size={24} color="black" />
            </TouchableOpacity>
          )
        }

        <TouchableOpacity style={{ marginLeft: 25 }} onPress={goBackHandler}>
          <Ionicons name="md-return-up-back-outline" size={24} color="black" />
        </TouchableOpacity>
      </PageHeader>

      <Modal 
        animationType="slide"
        visible={modal_showing}
      >
        <SafeAreaView style={StylesConstants.COMMON_STYLES.safeAreaViewContainer}>
          <PageHeader header="Edit Delivery">
            <TouchableOpacity style={{ marginLeft: 25 }} onPress={() => { set_modal_showing(false); }}>
              <Ionicons name="md-return-up-back-outline" size={24} color="black" />
            </TouchableOpacity>
          </PageHeader>
          
          <DeliveryForm delivery={delivery} isLoading={isLoading} onSubmit={handleEditDelivery} />
        </SafeAreaView>
      </Modal>

      <ScrollView
        style={[StylesConstants.COMMON_STYLES.bgGrey, { paddingHorizontal: 10, paddingTop: 10 }]} refreshControl={<RefreshControl refreshing={is_refreshing} onRefresh={onRefreshDelivery} />}>
        <View style={[StylesConstants.COMMON_STYLES.infoBoxZeroPaddingMargin, { padding: 15, marginBottom: 15 }]}>
          <Text style={{padding: 15, fontSize: 36}}>Owner</Text>

          <View style={[StylesConstants.COMMON_STYLES.flexRow, { alignItems: `center` }]}>
            <Image style={StylesConstants.COMMON_STYLES.userIcon} source={ownerIcon} />
            <View style={{ marginLeft: 10, flex: 1, justifyContent: `center` }}>
              <Text style={styles.headerText}>{ getUserFullName(delivery.owner!) }</Text>
              <Text style={styles.usernameText}>@{delivery.owner!.username}</Text>
            </View>
          </View>
        </View>

        <View style={[StylesConstants.COMMON_STYLES.infoBoxZeroPaddingMargin, { padding: 15, marginBottom: 10 }]}>
          <Text style={{padding: 15, fontSize: 36}}>Info</Text>
          <View style={{ marginTop: 25 }}>
            <Text style={styles.title}>{ delivery.title }</Text>
            <Text style={StylesConstants.COMMON_STYLES.textWrap}>{ delivery.description }</Text>
            <Text style={[statusTextStyle, { marginVertical: 15 }]}>{ status.display }</Text>
            {
              !!delivery.delivery_dispute && !delivery.completed && (
                <Text style={[disputeTextStyles[delivery.delivery_dispute.status], { flexShrink: 1, marginBottom: 15 }]}>
                  Dispute: {delivery.delivery_dispute.status}
                </Text>
              )
            }
          </View>

          {!!delivery.item_image_link && <Image style={{ width: 200, height: 200, marginVertical: 15 }} source={{ uri: delivery.item_image_link }} />}

          <Text style={styles.headerText}>Date Created</Text>
          <Text style={{ marginBottom: 10 }}>{ dateText }</Text>

          <View style={{ marginBottom: 15 }}>
            <Text style={styles.headerText}>Info</Text>
            <Text>Delivery ID: { delivery.id }</Text>
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
            <Text>Location: { delivery.from_location }</Text>
            <Text>Pickup From: { delivery.from_person }</Text>
            <Text>Phone: { delivery.from_person_phone }</Text>
            <Text>Email: { delivery.from_person_email }</Text>
            <Text>ID Required: { delivery.from_person_id_required ? 'yes' : 'no' }</Text>
            <Text>Signature Required: { delivery.from_person_sig_required ? 'yes' : 'no' }</Text>
          </View>

          <View style={{ marginBottom: 15 }}>
            <Text style={styles.headerText}>To</Text>
            <Text>Location: { delivery.to_location }</Text>
            <Text>Dropoff To: { delivery.to_person }</Text>
            <Text>Phone: { delivery.to_person_phone }</Text>
            <Text>Email: { delivery.to_person_email }</Text>
            <Text>ID Required: { delivery.to_person_id_required ? 'yes' : 'no' }</Text>
            <Text>Signature Required: { delivery.to_person_sig_required ? 'yes' : 'no' }</Text>
          </View>
        </View>

        {
          !!delivery.carrier_id && (
            <View>

              <View style={[StylesConstants.COMMON_STYLES.infoBoxZeroPaddingMargin, { marginBottom: 15 }]}>
                <Text style={{padding: 15, fontSize: 36}}>Carrier</Text>
                <View style={[StylesConstants.COMMON_STYLES.flexRow, { alignItems: `center`, padding: 15, marginBottom: 15 }]}>
                  <Image style={StylesConstants.COMMON_STYLES.userIcon} source={carrierIcon} />
                  <View style={{ marginLeft: 10, flex: 1, justifyContent: `center` }}>
                    <Text style={styles.headerText}>{ getUserFullName(delivery.carrier!) }</Text>
                    <Text style={styles.usernameText}>@{delivery.carrier!.username}</Text>
                  </View>
                </View>
              </View>

              <View style={[StylesConstants.COMMON_STYLES.infoBoxZeroPaddingMargin, { marginBottom: 15 }]}>
                <Text style={{padding: 15, fontSize: 36}}>Status</Text>

                <View style={{ padding: 15, marginBottom: 15 }}>
                  <Text style={styles.otherInfo}>
                    Picked Up: 
                    {
                      !delivery.datetime_picked_up 
                      ? ' no' 
                      : ' yes, at: ' + dateTimeTransform(delivery.datetime_picked_up) + ' (' + timeAgoTransform(delivery.datetime_picked_up) + ')'
                    }
                  </Text>
                  <Text style={styles.otherInfo}>
                    Dropped Off: 
                    {
                      !delivery.datetime_delivered 
                      ? ' no' 
                      : ' yes, at: ' + dateTimeTransform(delivery.datetime_delivered) + ' (' + timeAgoTransform(delivery.datetime_delivered) + ')'
                    }
                  </Text>
                  {
                    !!delivery.datetime_delivered && (
                      <Text style={styles.otherInfo}>Total time: {dateTimeCompareTransform(delivery.datetime_delivered, delivery.datetime_picked_up!)}</Text>
                    )
                  }
                  {
                    !!delivery.datetime_completed && (
                      <Text style={styles.otherInfo}>Completed: {dateTimeTransform(delivery.datetime_completed) + ' (' + timeAgoTransform(delivery.datetime_completed) + ')'}</Text>
                    )
                  }

                  {
                    isCarrier && !delivery.datetime_picked_up && (
                      <TouchableOpacity style={[StylesConstants.COMMON_STYLES.btnSuccessFullWidth, { marginTop: 10 }]} onPress={markAsPickedUp}>
                        <Text style={StylesConstants.COMMON_STYLES.btnTextWhite}>
                          Mark as Picked Up
                        </Text>
                      </TouchableOpacity>
                    )
                  }
                  {
                    isCarrier && !delivery.datetime_picked_up && (
                      <TouchableOpacity style={[StylesConstants.COMMON_STYLES.btnSecondaryFullWidth, { marginTop: 10 }]} onPress={unassignDelivery}>
                        <Text style={StylesConstants.COMMON_STYLES.btnTextWhite}>
                          Unassign Delivery
                        </Text>
                      </TouchableOpacity>
                    )
                  }

                  {
                    isCarrier && !!delivery.datetime_picked_up && !delivery.datetime_delivered && (
                      <TouchableOpacity style={[StylesConstants.COMMON_STYLES.btnSecondaryFullWidth, { marginTop: 10 }]} onPress={markAsReturned}>
                        <Text style={StylesConstants.COMMON_STYLES.btnTextWhite}>
                          Mark as Returned
                        </Text>
                      </TouchableOpacity>
                    )
                  }
                  {
                    isCarrier && !!delivery.datetime_picked_up && !delivery.datetime_delivered && (
                      <TouchableOpacity style={[StylesConstants.COMMON_STYLES.btnSuccessFullWidth, { marginTop: 10 }]} onPress={markAsDroppedOff}>
                        <Text style={StylesConstants.COMMON_STYLES.btnTextWhite}>
                          Mark as Dropped Off
                        </Text>
                      </TouchableOpacity>
                    )
                  }
                </View>

                {/* Images */}
                <View style={{ padding: 15, marginBottom: 15 }}>
                  {
                    !!delivery.delivered_image_link && (
                      <View>
                        <Text style={{ flex: 1 }}>Delivered Image</Text>
                        <Image style={{ flex: 1, width: 300, height: 300, marginVertical: 15 }} source={{ uri: delivery.delivered_image_link }} />
                      </View>
                    )
                  }

                  {
                    !!delivery.from_person_id_image_link && (
                      <View>
                        <Text style={{ flex: 1, marginBottom: 10 }}>Pickup person ID captured</Text>
                      </View>
                    )
                  }
                  {
                    !!delivery.from_person_sig_image_link && (
                      <View>
                        <Text style={{ flex: 1 }}>Pickup person signature</Text>
                        <Image style={{ flex: 1, width: 300, height: 300, marginVertical: 15 }} source={{ uri: delivery.from_person_sig_image_link }} />
                      </View>
                    )
                  }

                  {
                    !!delivery.to_person_id_image_link && (
                      <View>
                        <Text style={{ flex: 1,  marginBottom: 10 }}>Dropoff person ID captured</Text>
                      </View>
                    )
                  }
                  {
                    !!delivery.to_person_sig_image_link && (
                      <View>
                        <Text style={{ flex: 1 }}>Dropoff person signature</Text>
                        <Image style={{ flex: 1, width: 300, height: 300, marginVertical: 15 }} source={{ uri: delivery.to_person_sig_image_link }} />
                      </View>
                    )
                  }
                </View>
              </View>

              <TouchableOpacity onPress={() => { navToPage(`DeliveryTrackingUpdates`); }}>
                <View style={[StylesConstants.COMMON_STYLES.infoBoxZeroPaddingMargin, { padding: 15, marginBottom: 15 }, StylesConstants.COMMON_STYLES.flexRowSpaceBetween]}>
                  <Text style={{ fontSize: 24 }}>Tracking Updates</Text>

                  <MaterialIcons name="arrow-forward-ios" size={24} color="black" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => { navToPage(`DeliveryMessages`); }}>
                <View style={[StylesConstants.COMMON_STYLES.infoBoxZeroPaddingMargin, { padding: 15, marginBottom: 15 }, StylesConstants.COMMON_STYLES.flexRowSpaceBetweenCenter]}>
                  <Text style={{ fontSize: 24 }}>Messages</Text>

                  <MaterialIcons name="arrow-forward-ios" size={24} color="black" />
                </View>
              </TouchableOpacity>

              {
                isOwner && !delivery.completed && !!delivery.datetime_delivered && (
                  <>
                    <TouchableOpacity style={[StylesConstants.COMMON_STYLES.btnPrimaryFullWidth, { marginTop: 10 }]} onPress={payCarrier}>
                      <Text style={StylesConstants.COMMON_STYLES.btnTextWhite}>
                        Pay Carrier
                      </Text>
                    </TouchableOpacity>
                  </>
                )
              }

              {
                isCarrier && !delivery.completed && !!delivery.datetime_picked_up && !delivery.delivered_image_id && (
                  <>
                    <TouchableOpacity onPress={() => { set_delivered_image_modal_visible(true); }}>
                      <View style={[StylesConstants.COMMON_STYLES.infoBoxZeroPaddingMargin, { padding: 15, marginBottom: 15 }, StylesConstants.COMMON_STYLES.flexRowSpaceBetweenCenter]}>
                        <Text style={{ fontSize: 24 }}>Add Delivered Pictured</Text>
                        <MaterialIcons name="arrow-forward-ios" size={24} color="black" />
                      </View>
                    </TouchableOpacity>

                    <ImageUploadModal
                      header="Upload Delivered Image"
                      visible={delivered_image_modal_visible}
                      set_visible={set_delivered_image_modal_visible}
                      onSubmit={(imageInfo) => uploadDeliveryStatusImage(`delivered_image`, imageInfo)}
                    />
                  </>
                )
              }

              {/* From Person */}
              {
                isCarrier && !delivery.completed && !delivery.datetime_picked_up && !delivery.from_person_id_image_id && (
                  <>
                    <TouchableOpacity onPress={() => { set_from_id_image_modal_visible(true); }}>
                      <View style={[StylesConstants.COMMON_STYLES.infoBoxZeroPaddingMargin, { padding: 15, marginBottom: 15 }, StylesConstants.COMMON_STYLES.flexRowSpaceBetweenCenter]}>
                        <Text style={{ fontSize: 24 }}>Add Pickup Person ID</Text>
                        <MaterialIcons name="arrow-forward-ios" size={24} color="black" />
                      </View>
                    </TouchableOpacity>

                    <ImageUploadModal
                      header="Upload Pickup Person ID"
                      visible={from_id_image_modal_visible}
                      set_visible={set_from_id_image_modal_visible}
                      onSubmit={(imageInfo) => uploadDeliveryStatusImage(`from_id_image`, imageInfo)}
                    />
                  </>
                )
              }

              {
                isCarrier && !delivery.completed && !delivery.datetime_picked_up && !delivery.from_person_sig_image_id && (
                  <>
                    <TouchableOpacity onPress={() => { set_from_sig_image_modal_visible(true); }}>
                      <View style={[StylesConstants.COMMON_STYLES.infoBoxZeroPaddingMargin, { padding: 15, marginBottom: 15 }, StylesConstants.COMMON_STYLES.flexRowSpaceBetweenCenter]}>
                        <Text style={{ fontSize: 24 }}>Add Pickup Person Signature</Text>
                        <MaterialIcons name="arrow-forward-ios" size={24} color="black" />
                      </View>
                    </TouchableOpacity>

                    <SignatureCaptureModal
                      header="Upload Pickup Person Signature"
                      visible={from_sig_image_modal_visible}
                      set_visible={set_from_sig_image_modal_visible}
                      onSubmit={(imageInfo) => uploadDeliveryStatusImage(`from_sig_image`, imageInfo)}
                    />
                  </>
                )
              }

              {/* To Person */}
              {
                isCarrier && !delivery.completed && !!delivery.datetime_picked_up && !delivery.to_person_id_image_id && (
                  <>
                    <TouchableOpacity onPress={() => { set_to_id_image_modal_visible(true); }}>
                      <View style={[StylesConstants.COMMON_STYLES.infoBoxZeroPaddingMargin, { padding: 15, marginBottom: 15 }, StylesConstants.COMMON_STYLES.flexRowSpaceBetweenCenter]}>
                        <Text style={{ fontSize: 24 }}>Add Dropoff Person ID</Text>
                        <MaterialIcons name="arrow-forward-ios" size={24} color="black" />
                      </View>
                    </TouchableOpacity>

                    <ImageUploadModal
                      header="Upload Dropoff Person ID"
                      visible={to_id_image_modal_visible}
                      set_visible={set_to_id_image_modal_visible}
                      onSubmit={(imageInfo) => uploadDeliveryStatusImage(`to_id_image`, imageInfo)}
                    />
                  </>
                )
              }

              {
                isCarrier && !delivery.completed && !!delivery.datetime_picked_up && !delivery.to_person_sig_image_id && (
                  <>
                    <TouchableOpacity onPress={() => { set_to_sig_image_modal_visible(true); }}>
                      <View style={[StylesConstants.COMMON_STYLES.infoBoxZeroPaddingMargin, { padding: 15, marginBottom: 15 }, StylesConstants.COMMON_STYLES.flexRowSpaceBetweenCenter]}>
                        <Text style={{ fontSize: 24 }}>Add Dropoff Person Signature</Text>
                        <MaterialIcons name="arrow-forward-ios" size={24} color="black" />
                      </View>
                    </TouchableOpacity>

                    <SignatureCaptureModal
                      header="Upload Dropoff Person Signature"
                      visible={to_sig_image_modal_visible}
                      set_visible={set_to_sig_image_modal_visible}
                      onSubmit={(imageInfo) => uploadDeliveryStatusImage(`to_sig_image`, imageInfo)}
                    />
                  </>
                )
              }

              {
                (isOwner || isCarrier) && !!delivery.delivery_dispute && (
                  <TouchableOpacity style={[StylesConstants.COMMON_STYLES.btnWarningFullWidth, { marginVertical: 10 }]} onPress={() => { navToPage(`DeliveryDispute`); }}>
                      <Text style={StylesConstants.COMMON_STYLES.btnTextBlack}>
                        See Dispute Info
                      </Text>
                    </TouchableOpacity>
                )
              }

              {
                (isOwner || isCarrier) && !delivery.completed && !delivery.delivery_dispute && (
                  <>
                    {/* <TouchableOpacity style={[StylesConstants.COMMON_STYLES.btnWarningFullWidth, { marginVertical: 10 }]} onPress={() => { set_open_dispute_modal_visible(true); }}>
                      <Text style={StylesConstants.COMMON_STYLES.btnTextBlack}>
                        Open a Dispute
                      </Text>
                    </TouchableOpacity> */}
                    <CommonModal
                      header="Open a Dispute"
                      modal_visible={open_dispute_modal_visible}
                      set_modal_visible={set_open_dispute_modal_visible}
                    >
                      <View style={{  }}>
                        <Text style={{ fontSize: 24, marginBottom: 10 }}>What's wrong?</Text>
                        <Text style={{ fontSize: 16, marginBottom: 10 }}>
                          Use the form below to open a dispute and get customer support involved with this delivery.
                        </Text>
  
                        <CommonTextInput placeholder="Enter Dispute Title" required={true} label="Title" value={dispute_title} onChange={(value) => set_dispute_title(value)} />
                        <TextAreaInput placeholder="Enter Dispute Details" required={true} label="Details" value={dispute_details} onChange={(value) => set_dispute_details(value)} />
                        <CommonTextInput placeholder="Enter Compensation" required={true} label="Amount to be Compensation" keyboardType="number-pad" value={dispute_compensation} onChange={(value) => set_dispute_compensation(parseInt(value))} />

                        {
                          !dispute_image && (
                            <>
                              <TouchableOpacity style={StylesConstants.COMMON_STYLES.btnSecondaryFullWidth} onPress={() => set_add_dispute_image_modal_visible(true)}>
                                <Text style={StylesConstants.COMMON_STYLES.btnTextWhite}>Add Picture</Text>
                              </TouchableOpacity>

                              <ImageUploadModal
                                header="Upload Dispute Picture"
                                visible={add_dispute_image_modal_visible}
                                set_visible={set_add_dispute_image_modal_visible}
                                onSubmit={(imageInfo) => { set_dispute_image(imageInfo.uri); }}
                              />
                            </>
                          )
                        }
                        {
                          !!dispute_image && (
                            <TouchableOpacity style={StylesConstants.COMMON_STYLES.btnSecondaryFullWidth} onPress={() => set_dispute_image("")}>
                              <Text style={StylesConstants.COMMON_STYLES.btnTextWhite}>Clear Image</Text>
                            </TouchableOpacity>
                          )
                        }
                        {!!dispute_image && <Image style={{ width: 200, height: 200, marginTop: 15 }} source={{ uri: dispute_image }} />}

                        <TouchableOpacity style={[StylesConstants.COMMON_STYLES.btnPrimaryFullWidth, { marginVertical: 20 }]} onPress={createDeliveryDispute}>
                          <Text style={StylesConstants.COMMON_STYLES.btnTextWhite}>
                            Open Dispute
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </CommonModal>
                  </>
                )
              }

              <>
                <TouchableOpacity style={[StylesConstants.COMMON_STYLES.btnInfoFullWidth, { marginVertical: 10 }]} onPress={() => { set_help_guide_modal_visible(true); }}>
                  <Text style={StylesConstants.COMMON_STYLES.btnTextWhite}>
                    Help & Guide
                  </Text>
                </TouchableOpacity>
                <CommonModal
                  header="Help & Guide"
                  modal_visible={help_guide_modal_visible}
                  set_modal_visible={set_help_guide_modal_visible}
                >
                  <DeliveryHelpGuideComponent />
                </CommonModal>
              </>

            </View>
          )
        }

        <View style={{ marginBottom: 25 }}></View>
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

  textDeliveryOpenDispute: {
    padding: 4,
    color: `white`,
    backgroundColor: `red`,
    borderColor: `red`,
    borderWidth: 0.5,
    borderRadius: 4,
    // overflow: 'hidden',
  },
});
