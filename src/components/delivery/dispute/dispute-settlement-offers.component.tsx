import {
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Text,
  View,
  StyleSheet,
  Image,
  RefreshControl,
  Platform,
  FlatList,
  TouchableOpacity,
} from "react-native";
import {
  IDelivery,
  IDeliveryDispute,
  IDeliveryDisputeSettlementOffer,
  IDeliveryDisputeLog,
} from "../../../interfaces/deliverme.interface";
import { StylesConstants } from "../../../services/styles.constants";
import { finalize } from "rxjs";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { FontAwesome5 } from '@expo/vector-icons';

import { PageHeaderBack } from "../../../components/page-headers/page-header-back.component";
import {
  add_on_stripe_processing_fee,
  dateTimeTransform,
  formatStripeAmount,
  getUserFullName,
  getUserIconOrAnon,
  makeUiDate,
  prepareFormData,
  timeAgoTransform,
} from "../../../utils/common.utils";
import React, { useEffect, useState } from "react";
import { LoadingScreenComponent } from "../../../components/loading-screen.component";
import { DeliveryService } from "../../../services/delivery.service";
import { TextAreaInput } from "../../../components/inputs/textarea.component";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { ImageUploadModal } from "../../image-upload-modal.component";
import { firstBy } from 'thenby';
import { CommonModal } from "../../modal.component";
import { CommonTextInput } from "../../inputs/textinput.component";
import { UserStoreService } from "../../../services/user-store.service";
import { IUser } from "../../../interfaces/user.interface";
import { DeliveryDisputeSettlementOfferStatus } from "../../../enums/modern.enums";
import { UsersService } from "../../../services/users.service";
import { SelectInput } from "../../inputs/select.component";






const scrollStyles = StyleSheet.create({
  ios: {
    padding: 10,
    // marginBottom: 20,
    // backgroundColor: `purple`
  },
  android: {
    padding: 10,
    // marginBottom: 20,
    // backgroundColor: `purple`,
    // flexGrow: 1
  },
});

const scrollStyle = scrollStyles[Platform.OS]; 



const DisputeSettlementOffer = (props) => {
  const you: IUser = props.you;
  const dispute_settlement_offer: IDeliveryDisputeSettlementOffer = props.dispute_settlement_offer;
  const date_created: string = makeUiDate(dispute_settlement_offer.created_at);

  const [add_payment_method_modal_visible, set_add_payment_method_modal_visible] = useState<boolean>(false);
  const [dispute_settlement_offer_payment_method, set_dispute_settlement_offer_payment_method] = useState<string>('');

  const creatorView = !!dispute_settlement_offer.agent_id ? (
    <View style={[StylesConstants.COMMON_STYLES.flexRow, { alignItems: `center` }]}>
      <Image style={StylesConstants.COMMON_STYLES.userIcon} source={getUserIconOrAnon(dispute_settlement_offer.agent)} />
      <View style={{ marginLeft: 10, flex: 1, justifyContent: `center` }}>
        <Text style={styles.headerText}>{ getUserFullName(dispute_settlement_offer.agent!) }</Text>
      </View>
    </View>
  ) : (
    <View style={[StylesConstants.COMMON_STYLES.flexRow, { alignItems: `center` }]}>
      <Image style={StylesConstants.COMMON_STYLES.userIcon} source={getUserIconOrAnon(dispute_settlement_offer.user)} />
      <View style={{ marginLeft: 10, flex: 1, justifyContent: `center` }}>
        <Text style={styles.headerText}>{ getUserFullName(dispute_settlement_offer.user!) }</Text>
      </View>
    </View>
  );

  const isPendingOffer = dispute_settlement_offer.status === DeliveryDisputeSettlementOfferStatus.PENDING;
  const isOfferCreator = you.id === dispute_settlement_offer.creator_id;

  const confirmCancel = () => {
    Alert.alert(
      "Cancel Settlement Offer?",
      "Are you sure you want to cancel your settlement offer? This cannot be undone however you can creator another offer.",
      [
        {
          text: "Go Back",
          style: "cancel",
          onPress: () => {},
        },
        {
          text: "Confirm",
          style: "default",
          onPress: () => props.cancelPressed(dispute_settlement_offer),
        }
      ]
    );
  };
  const confirmAccept = (action) => {
    Alert.alert(
      "Accept Settlement Offer?",
      "If you accept, an invoice will be create and you will be obligated to pay.",
      [
        {
          text: "Go Back",
          style: "cancel",
          onPress: () => {},
        },
        {
          text: "Confirm",
          style: "default",
          // onPress: () => props.acceptPressed(dispute_settlement_offer),
          onPress: () => set_add_payment_method_modal_visible(true),
        }
      ]
    );
  };
  const confirmDecline = (action) => {
    Alert.alert(
      "Decline Settlement Offer?",
      "",
      [
        {
          text: "Go Back",
          style: "cancel",
          onPress: () => {},
        },
        {
          text: "Confirm",
          style: "default",
          onPress: () => props.declinePressed(dispute_settlement_offer),
        }
      ]
    );
  };

  const allowedControls = isOfferCreator ? (
    // offer creator
    <View style={{ flexDirection: `row` }}>
      <TouchableOpacity
        style={[StylesConstants.COMMON_STYLES.btnDangerFullWidth, {  }]}
        onPress={confirmCancel}
      >
        <View style={[{ flexDirection: `row`, alignItems: `center`, flex: 1 }]}>
          <Ionicons name="trash-bin" size={24} color="white" />
          <View style={{ marginHorizontal: 5 }}></View>
          <Text style={StylesConstants.COMMON_STYLES.btnTextWhite}>Cancel</Text>
        </View>
      </TouchableOpacity> 
    </View>
  ) : (
    // other user
    <View style={{ flexDirection: `row` }}>
      <TouchableOpacity
        style={[StylesConstants.COMMON_STYLES.btnSuccess, { width: `auto`, flexGrow: 1 }]}
        onPress={confirmAccept}
      >
        <View style={[{ flexDirection: `row`, alignItems: `center`, flex: 1 }]}>
          <FontAwesome5 name="check" size={24} color="white" />
          <View style={{ marginHorizontal: 5 }}></View>
          <Text style={StylesConstants.COMMON_STYLES.btnTextWhite}>Accept</Text>
        </View>
      </TouchableOpacity> 

      <View style={{ marginHorizontal: 2.5 }}></View>

      <TouchableOpacity
        style={[StylesConstants.COMMON_STYLES.btnDanger, { width: `auto`, flexGrow: 1 }]}
        onPress={confirmDecline}
      >
        <View style={[{ flexDirection: `row`, alignItems: `center`, flex: 1 }]}>
          <FontAwesome5 name="times" size={24} color="white" />
          <View style={{ marginHorizontal: 5 }}></View>
          <Text style={StylesConstants.COMMON_STYLES.btnTextWhite}>Decline</Text>
        </View>
      </TouchableOpacity> 
    </View>
  );


  const chargeFeeData = add_on_stripe_processing_fee(dispute_settlement_offer.offer_amount, UserStoreService.is_subscription_active);

  return (
    <View style={StylesConstants.COMMON_STYLES.infoBox}>
      <View style={{ marginBottom: 15 }}>{ creatorView }</View>

      <View>
        <Text>Settlement Amount: ${ dispute_settlement_offer.offer_amount } (Goes to settlement creator)</Text>
        <Text>Application fee: ${formatStripeAmount(chargeFeeData.app_fee)}</Text>
        <Text>Processing fee: ${formatStripeAmount(chargeFeeData.stripe_final_processing_fee)} (Non refundable)</Text>

        <Text style={{ fontSize: 24, marginVertical: 10 }}>
          Final total: ${formatStripeAmount(chargeFeeData.final_total)}
        </Text>

        <Text style={{ fontSize: 16, marginBottom: 20 }}>Message: { dispute_settlement_offer.message }</Text>
        <Text style={{ fontSize: 16, marginBottom: 20 }}>Status: { dispute_settlement_offer.status }</Text>
        <Text style={{ fontSize: 12 }}>{ date_created }</Text>
      </View>

      {
        !isOfferCreator && (
          <CommonModal header="Choose Payment Method" modal_visible={add_payment_method_modal_visible} set_modal_visible={set_add_payment_method_modal_visible}>
            <View>
              {
                (!props.payment_methods || !props.payment_methods) ? (
                  <Text>
                    You do not have any payment methods on your account. Go to your settings to add one.
                  </Text>
                ) : (
                  <>
                    <Text>
                      Choose a payment method on your account
                    </Text>

                    <SelectInput
                      placeholder="Select Payment Method"
                      required={true} label="Payment Method"
                      items={props.payment_methods} 
                      value={dispute_settlement_offer_payment_method}
                      onChange={(value) => set_dispute_settlement_offer_payment_method(value)} 
                    />
                    <TouchableOpacity style={StylesConstants.COMMON_STYLES.btnPrimaryFullWidth} onPress={() =>{
                      if (!dispute_settlement_offer_payment_method) {
                        Alert.alert(`Please select a payment method`);
                        return;
                      }
                      set_add_payment_method_modal_visible(false);
                      props.acceptPressed(dispute_settlement_offer, dispute_settlement_offer_payment_method);
                      set_dispute_settlement_offer_payment_method('');
                    }}>
                      <Text style={StylesConstants.COMMON_STYLES.btnTextWhite}>Submit</Text>
                    </TouchableOpacity>
                  </>
                ) 
              }
            </View>
          </CommonModal>
        )
      }

      { isPendingOffer && <View style={{ marginTop: 15 }}>{allowedControls}</View> }
    </View>
  );
};



export function DisputeSettlementOffersComponent (props) {
  const navigation = useNavigation<any>();
  const delivery: IDelivery = props.delivery;
  const dispute: IDeliveryDispute = props.route.params.dispute;
  const header: string = props.header;

  const [you, set_you] = useState(UserStoreService.getLatestState()!);
  const [dispute_settlement_offers, set_dispute_settlement_offers] = useState<IDeliveryDisputeSettlementOffer[]>(dispute.delivery_dispute_settlement_offers!);

  const [payment_methods, set_payment_methods] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [is_refreshing, set_is_refreshing] = useState<boolean>(false);
  const [info_modal_visible, set_info_modal_visible] = useState<boolean>(false);

  // // form body
  const [add_settlement_offer_modal_visible, set_add_settlement_offer_modal_visible] = useState<boolean>(false);
  const [dispute_settlement_offer_message, set_dispute_settlement_offer_message] = useState<string>('');
  const [dispute_settlement_offer_amount, set_dispute_settlement_offer_amount] = useState<number>(0);
  

  const there_is_a_pending_offer = !!dispute_settlement_offers && dispute_settlement_offers.some(offer => offer.status === DeliveryDisputeSettlementOfferStatus.PENDING);
  const there_is_an_accepted_offer = !!dispute_settlement_offers && dispute_settlement_offers.some(offer => offer.status === DeliveryDisputeSettlementOfferStatus.ACCEPTED);
  const show_create_btn = !there_is_a_pending_offer && !there_is_an_accepted_offer;

  let min_id: number | undefined = dispute_settlement_offers && dispute_settlement_offers.length
    ? dispute_settlement_offers[dispute_settlement_offers.length - 1].id 
    : undefined;

  dispute_settlement_offers.sort(firstBy(function(a, b) { return b.id - a.id }));

  useEffect(() => {
    UsersService.get_user_customer_cards_payment_methods(you.id)
    .subscribe({
      next: (response) => {
        console.log(`\n\n`, response);
        const newPaymentMethods = response.data.map(
          pm => ({
            id: pm.id,
            key: pm.id,
            value: pm.id,
            label: `${pm.card.brand.toUpperCase()} ${pm.card.last4} ${pm.card.exp_month}/${pm.card.exp_year}` 
          })
        );
        response.data && set_payment_methods(newPaymentMethods);
      },
      error: (error) => {
        error.response?.data?.message && Alert.alert(error.response?.data?.message);
      }
    });
  }, []);

  // Handlers

  const onRefresh = () => {
    set_is_refreshing(true);
    min_id = undefined;
    DeliveryService.get_delivery_dispute_info_by_delivery_id(delivery.id)
    .pipe(finalize(() => { set_is_refreshing(false); }))
    .subscribe({
      next: (response) => {
        Object.assign(dispute, response.data);
        set_dispute_settlement_offers(dispute.delivery_dispute_settlement_offers || []);
      },
      error: (error) => {
        error.response?.data?.message && Alert.alert(error.response?.data?.message);
      }
    })
  }

  const onEndReached = () => {
    // if (min_id && min_id <= 1) {
    //   return;
    // }
    // setIsLoadingMore(true);
    // DeliveryService.getUserDeliveries(you.id, min_id)
    // .pipe(finalize(() => {
    //   setIsLoadingMore(false);
    // }))
    // .subscribe({
    //   next: (response) => {
    //     set_deliveries([...deliveries, ...response.data]);
    //   }
    // });
  };

  const navToPage = (page) => {
    navigation.navigate(page, { delivery, dispute });
  };

  const createDisputeSettlementOffer = () => {
    if (!dispute_settlement_offer_message) {
      Alert.alert(`Message body is required`);
      return;
    }
    if (!dispute_settlement_offer_amount) {
      Alert.alert(`Message body is required`);
      return;
    }

    const payload = {
      message: dispute_settlement_offer_message,
      offer_amount: dispute_settlement_offer_amount,
    };

    setIsLoading(true);
    DeliveryService.make_delivery_dispute_settlement_offer(delivery.id, payload)
    .pipe(finalize(() => { setIsLoading(false); }))
    .subscribe({
      next: (response) => {
        response.message && Alert.alert(response.message);
        const new_offer: IDeliveryDisputeSettlementOffer = response.data;
        dispute_settlement_offers.unshift(new_offer);
        set_dispute_settlement_offers([ ...dispute_settlement_offers ]);
        set_dispute_settlement_offer_message('');
        set_dispute_settlement_offer_amount(0);
        set_add_settlement_offer_modal_visible(false);
      },
      error: (error) => {
        error.response?.data?.message && Alert.alert(error.response?.data?.message);
      }
    });
  };

  const cancelOffer = (offer: IDeliveryDisputeSettlementOffer) => {
    setIsLoading(true);
    DeliveryService.cancel_delivery_dispute_settlement_offer(delivery.id)
    .pipe(finalize(() => { setIsLoading(false); }))
    .subscribe({
      next: (response) => {
        response.message && Alert.alert(response.message);
        const updated_offer: IDeliveryDisputeSettlementOffer = response.data;
        Object.assign(offer, updated_offer);
        set_dispute_settlement_offers([ ...dispute_settlement_offers ]);
      },
      error: (error) => {
        error.response?.data?.message && Alert.alert(error.response?.data?.message);
      }
    });
  };

  const acceptOffer = (offer: IDeliveryDisputeSettlementOffer, payment_method_id: string) => {
    setIsLoading(true);
    DeliveryService.accept_delivery_dispute_settlement_offer(delivery.id, { payment_method_id })
    .pipe(finalize(() => { setIsLoading(false); }))
    .subscribe({
      next: (response) => {
        response.message && Alert.alert(response.message);
        const updated_offer: IDeliveryDisputeSettlementOffer = response.data;
        Object.assign(offer, updated_offer);
        set_dispute_settlement_offers([ ...dispute_settlement_offers ]);
      },
      error: (error) => {
        error.response?.data?.message && Alert.alert(error.response?.data?.message);
      }
    });
  };

  const declineOffer = (offer: IDeliveryDisputeSettlementOffer) => {
    setIsLoading(true);
    DeliveryService.decline_delivery_dispute_settlement_offer(delivery.id)
    .pipe(finalize(() => { setIsLoading(false); }))
    .subscribe({
      next: (response) => {
        response.message && Alert.alert(response.message);
        const updated_offer: IDeliveryDisputeSettlementOffer = response.data;
        Object.assign(offer, updated_offer);
        set_dispute_settlement_offers([ ...dispute_settlement_offers ]);
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
    <SafeAreaView style={[StylesConstants.COMMON_STYLES.safeAreaViewContainer]}>
      <PageHeaderBack header={header}>
        <TouchableOpacity style={{ marginRight: 20 }} onPress={() => { set_info_modal_visible(true) }}>
          <Ionicons name="information-circle" size={24} color="black" />
        </TouchableOpacity>

        {
          show_create_btn && (
            <TouchableOpacity style={{ marginRight: 20 }} onPress={() => { set_add_settlement_offer_modal_visible(true) }}>
              <MaterialIcons name="add-circle" size={24} color="black" />
            </TouchableOpacity>
          )
        }
      </PageHeaderBack>

      <CommonModal header="Info" modal_visible={info_modal_visible} set_modal_visible={set_info_modal_visible}>
        <View>
          <Text>
            Settlement offers are a way for users to resolve a dispute before getting customer service involved. 
            It is encouraged for used to communicate with one another to working towards resolving disputes.
          </Text>
        </View>
      </CommonModal>

      <CommonModal header="Add Dispute Log" modal_visible={add_settlement_offer_modal_visible} set_modal_visible={set_add_settlement_offer_modal_visible}>
        <View style={[StylesConstants.COMMON_STYLES.borderB, {  marginBottom: 0, padding: 15, backgroundColor: `` }]}>
          <View style={{ flexDirection: `column`, justifyContent: `center` }}>
            <CommonTextInput
              placeholder="Enter Offer Amount in US Dollars"
              required={true}
              label="Amount in Dollars"
              keyboardType="number-pad" 
              value={dispute_settlement_offer_amount} 
              onChange={(value) => set_dispute_settlement_offer_amount(parseInt(value))} 
            />
            
            <TextAreaInput
              placeholder="Enter Dispute Log Message Body" 
              label="" 
              required={false} 
              value={dispute_settlement_offer_message} 
              height={100}
              onChange={(value) => set_dispute_settlement_offer_message(value)}
            />
          </View>

          <View style={{ justifyContent: `center` }}>
            <TouchableOpacity style={[StylesConstants.COMMON_STYLES.btnPrimaryFullWidth, { marginTop: 15 }]} onPress={createDisputeSettlementOffer}>
              <Text style={StylesConstants.COMMON_STYLES.btnTextWhite}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </CommonModal>

      <FlatList
        style={scrollStyle}
        data={dispute_settlement_offers}
        renderItem={
          (item) => (
            <DisputeSettlementOffer
              dispute_settlement_offer={item.item} 
              index={item.index} 
              you={you}
              payment_methods={payment_methods}
              cancelPressed={(offer) => { cancelOffer(offer); }}
              acceptPressed={(offer, payment_method_id) => { acceptOffer(offer, payment_method_id); }}
              declinePressed={(offer) => { declineOffer(offer); }}
            />
          )
        }
        refreshControl={<RefreshControl refreshing={is_refreshing} onRefresh={onRefresh} />}
        keyExtractor={settlement_offer => settlement_offer.id.toString()}
        ItemSeparatorComponent={() => <></>}
        onEndReached={onEndReached}
        ListFooterComponent={<ActivityIndicator animating={isLoadingMore} />}
        ListEmptyComponent={
          <View style={[StylesConstants.COMMON_STYLES.flexCenter, { height: 250 }]}>
            <Text style={{ color: StylesConstants.MEDIUM_GREY }}>None for now</Text>
          </View>
        }
      />
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
});
