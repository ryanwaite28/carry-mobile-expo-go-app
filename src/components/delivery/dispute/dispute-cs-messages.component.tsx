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
  IDeliveryDisputeCustomerSupportMessage,
  IDeliveryDisputeLog,
} from "../../../interfaces/deliverme.interface";
import { StylesConstants } from "../../../services/styles.constants";
import { finalize } from "rxjs";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";

import { PageHeaderBack } from "../../../components/page-headers/page-header-back.component";
import {
  dateTimeTransform,
  getUserFullName,
  getUserIconOrAnon,
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



const DisputeMessage = (props) => {
  const dispute_message: IDeliveryDisputeCustomerSupportMessage = props.dispute_message;
  const date_created = dateTimeTransform(dispute_message.created_at) + ' (' + timeAgoTransform(dispute_message.created_at) + ')';

  const creatorView = !!dispute_message.agent_id ? (
    <View style={[StylesConstants.COMMON_STYLES.flexRow, { alignItems: `center` }]}>
      <Image style={StylesConstants.COMMON_STYLES.userIcon} source={getUserIconOrAnon(dispute_message.agent)} />
      <View style={{ marginLeft: 10, flex: 1, justifyContent: `center` }}>
        <Text style={styles.headerText}>{ getUserFullName(dispute_message.agent!) }</Text>
      </View>
    </View>
  ) : (
    <View style={[StylesConstants.COMMON_STYLES.flexRow, { alignItems: `center` }]}>
      <Image style={StylesConstants.COMMON_STYLES.userIcon} source={getUserIconOrAnon(dispute_message.user)} />
      <View style={{ marginLeft: 10, flex: 1, justifyContent: `center` }}>
        <Text style={styles.headerText}>{ getUserFullName(dispute_message.user!) }</Text>
      </View>
    </View>
  );

  return (
    <View style={StylesConstants.COMMON_STYLES.infoBox}>
      <View style={{ marginBottom: 15 }}>{ creatorView }</View>
      <View>
        <Text style={{ fontSize: 24, marginBottom: 10 }}>{ dispute_message.body }</Text>
        <Text style={{  }}>{ date_created }</Text>
        {dispute_message.image_link && <Image style={{ width: 200, height: 200, marginTop: 15 }} source={{ uri: dispute_message.image_link }} />}
      </View>
    </View>
  );
};



export function DisputeCustomerSupportMessagesComponent (props) {
  const navigation = useNavigation<any>();
  const delivery: IDelivery = props.delivery;
  const dispute: IDeliveryDispute = props.route.params.dispute;
  const header: string = props.header;

  const [dispute_messages, set_dispute_messages] = useState<IDeliveryDisputeCustomerSupportMessage[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [is_refreshing, set_is_refreshing] = useState<boolean>(false);
  const [info_modal_visible, set_info_modal_visible] = useState<boolean>(false);

  // form body
  const [add_message_modal_visible, set_add_message_modal_visible] = useState<boolean>(false);
  const [dispute_message_body, set_dispute_message_body] = useState<string>('');
  const [dispute_message_image, set_dispute_message_image] = useState<string>('');
  const [add_dispute_message_image_modal_visible, set_add_dispute_message_image_modal_visible] = useState<boolean>(false);
  

  useEffect(() => {
    DeliveryService.get_user_dispute_messages_by_user_id_and_dispute_id(delivery.id)
      .pipe(finalize(() => { setIsLoading(false); }))
      .subscribe({
        next: (response) => {
          set_dispute_messages(response.data!);
        },
        error: (error) => {
          error.response?.data?.message && Alert.alert(error.response?.data?.message);
        }
      });
  }, []);



  // Handlers

  const onRefresh = () => {
    set_is_refreshing(true);
    DeliveryService.get_user_dispute_messages_by_user_id_and_dispute_id(delivery.id)
      .pipe(finalize(() => { set_is_refreshing(false); }))
      .subscribe({
        next: (response) => {
          set_dispute_messages(response.data!);
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

  const createDisputeMessage = () => {
    if (!dispute_message_body) {
      Alert.alert(`Message body is required`);
      return;
    }

    const payload = {
      body: dispute_message_body,
      is_from_cs: false,
    };
    const formData = prepareFormData({ payload, imageName: `image`, imageUri: dispute_message_image });

    setIsLoading(true);
    DeliveryService.create_delivery_dispute_customer_service_message(delivery.id, formData)
    .pipe(finalize(() => { setIsLoading(false); }))
    .subscribe({
      next: (response) => {
        response.message && Alert.alert(response.message);
        const new_message: IDeliveryDisputeCustomerSupportMessage = response.data;
        dispute_messages.unshift(new_message);
        set_dispute_messages([ ...dispute_messages ]);
        set_add_message_modal_visible(false);
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

        <TouchableOpacity style={{ marginRight: 20 }} onPress={() => { set_add_message_modal_visible(true) }}>
          <MaterialIcons name="add-circle" size={24} color="black" />
        </TouchableOpacity>
      </PageHeaderBack>

      <CommonModal header="Info" modal_visible={info_modal_visible} set_modal_visible={set_info_modal_visible}>
        <View>
          <Text>
            This is communications between you and the customer service agent assigned to this dispute.
          </Text>
        </View>
      </CommonModal>

      <CommonModal header="Add Dispute Message" modal_visible={add_message_modal_visible} set_modal_visible={set_add_message_modal_visible}>
        <View style={[StylesConstants.COMMON_STYLES.borderB, {  marginBottom: 0, padding: 15, backgroundColor: `` }]}>
          <View style={{ flexDirection: `column`, justifyContent: `center` }}>
            <TextAreaInput
              placeholder="Enter Dispute Message Body" 
              label="" 
              required={false} 
              value={dispute_message_body} 
              height={100}
              onChange={(value) => set_dispute_message_body(value)}
            />

              {/* <View style={{ marginHorizontal: 10 }}></View> */}

            <TouchableOpacity
              style={[(!!dispute_message_image ? StylesConstants.COMMON_STYLES.btnDangerFullWidth : StylesConstants.COMMON_STYLES.btnSecondaryFullWidth), {  }]}
              onPress={() => !!dispute_message_image ? set_dispute_message_image('') : set_add_dispute_message_image_modal_visible(true)}
            >
              <Ionicons name={!!dispute_message_image ? "trash-bin" : "camera"} size={24} color="white" />
            </TouchableOpacity> 
            <ImageUploadModal
              header="Upload Dispute Message Picture"
              visible={add_dispute_message_image_modal_visible}
              set_visible={set_add_dispute_message_image_modal_visible}
              onSubmit={(imageInfo) => { set_dispute_message_image(imageInfo.uri); }}
            />
          </View>

          <View style={{ justifyContent: `center` }}>
            <TouchableOpacity style={[StylesConstants.COMMON_STYLES.btnPrimaryFullWidth, { marginTop: 15 }]} onPress={createDisputeMessage}>
              <Text style={StylesConstants.COMMON_STYLES.btnTextWhite}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </CommonModal>



      <FlatList
        style={scrollStyle}
        data={dispute_messages}
        renderItem={(item) => <DisputeMessage dispute_message={item.item} index={item.index} />}
        refreshControl={<RefreshControl refreshing={is_refreshing} onRefresh={onRefresh} />}
        keyExtractor={message => message.id.toString()}
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
