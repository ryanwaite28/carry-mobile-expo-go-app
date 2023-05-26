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
  IDeliveryDisputeLog,
} from "../../../interfaces/deliverme.interface";
import { StylesConstants } from "../../../services/styles.constants";
import { finalize } from "rxjs";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";

import { PageHeader } from "../../../components/page-headers/page-header.component";
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



const DisputeLog = (props) => {
  const dispute_log: IDeliveryDisputeLog = props.dispute_log;
  const date_created = dateTimeTransform(dispute_log.created_at) + ' (' + timeAgoTransform(dispute_log.created_at) + ')';

  const creatorView = !!dispute_log.agent_id ? (
    <View style={[StylesConstants.COMMON_STYLES.flexRow, { alignItems: `center` }]}>
      <Image style={StylesConstants.COMMON_STYLES.userIcon} source={getUserIconOrAnon(dispute_log.agent)} />
      <View style={{ marginLeft: 10, flex: 1, justifyContent: `center` }}>
        <Text style={styles.headerText}>{ getUserFullName(dispute_log.agent!) }</Text>
      </View>
    </View>
  ) : (
    <View style={[StylesConstants.COMMON_STYLES.flexRow, { alignItems: `center` }]}>
      <Image style={StylesConstants.COMMON_STYLES.userIcon} source={getUserIconOrAnon(dispute_log.creator)} />
      <View style={{ marginLeft: 10, flex: 1, justifyContent: `center` }}>
        <Text style={styles.headerText}>{ getUserFullName(dispute_log.creator!) }</Text>
      </View>
    </View>
  );

  return (
    <View style={StylesConstants.COMMON_STYLES.infoBox}>
      <View style={{ marginBottom: 15 }}>{ creatorView }</View>
      <View>
        <Text style={{ fontSize: 24, marginBottom: 10 }}>{ dispute_log.body }</Text>
        <Text style={{  }}>{ date_created }</Text>
        {dispute_log.image_link && <Image style={{ width: 200, height: 200, marginTop: 15 }} source={{ uri: dispute_log.image_link }} />}
      </View>
    </View>
  );
};





export function DisputeLogsComponent (props) {
  const navigation = useNavigation<any>();
  const delivery: IDelivery = props.delivery;
  const dispute: IDeliveryDispute = props.route.params.dispute;
  const header: string = props.header;


  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [is_refreshing, set_is_refreshing] = useState<boolean>(false);
  const [dispute_logs, set_dispute_logs] = useState<IDeliveryDisputeLog[]>(dispute.delivery_dispute_logs?.sort(firstBy(function(a, b) { return b.id - a.id })) || []);
  
  // form body
  const [add_log_modal_visible, set_add_log_modal_visible] = useState<boolean>(false);
  const [dispute_log_body, set_dispute_log_body] = useState<string>('');
  const [dispute_log_image, set_dispute_log_image] = useState<string>('');
  const [add_dispute_log_image_modal_visible, set_add_dispute_log_image_modal_visible] = useState<boolean>(false);

  let min_id: number | undefined = dispute_logs && dispute_logs.length ? dispute_logs[dispute_logs.length - 1].id : undefined;


  // Handlers

  const onRefresh = () => {
    set_is_refreshing(true);
    min_id = undefined;
    DeliveryService.get_delivery_dispute_info_by_delivery_id(delivery.id)
    .pipe(finalize(() => { set_is_refreshing(false); }))
    .subscribe({
      next: (response) => {
        Object.assign(dispute, response.data);
        set_dispute_logs(dispute.delivery_dispute_logs!);
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
    //   },
    // error: (error) => {
    //   error.response?.data?.message && Alert.alert(error.response?.data?.message);
    // }
    // });
  };

  const navToPage = (page) => {
    navigation.navigate(page, { delivery, dispute });
  };


  const createDisputeLog = () => {
    if (!dispute_log_body) {
      Alert.alert(`Message body is required`);
      return;
    }

    const payload = {
      body: dispute_log_body,
    };
    const formData = prepareFormData({ payload, imageName: `image`, imageUri: dispute_log_image });

    setIsLoading(true);
    DeliveryService.create_delivery_dispute_log(delivery.id, formData)
    .pipe(finalize(() => { setIsLoading(false); }))
    .subscribe({
      next: (response) => {
        response.message && Alert.alert(response.message);
        const new_log: IDeliveryDisputeLog = response.data;
        dispute_logs.unshift(new_log);
        set_dispute_logs([ ...dispute_logs ]);
        set_add_log_modal_visible(false);
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
        <TouchableOpacity style={{ marginRight: 20 }} onPress={() => { set_add_log_modal_visible(true) }}>
          <Ionicons name="md-add-circle-sharp" size={24} color="black" />
        </TouchableOpacity>
      </PageHeaderBack>

      <CommonModal header="Add Dispute Log" modal_visible={add_log_modal_visible} set_modal_visible={set_add_log_modal_visible}>
        <View style={[StylesConstants.COMMON_STYLES.borderB, {  marginBottom: 0, padding: 15, backgroundColor: `` }]}>
          <View style={{ flexDirection: `column`, justifyContent: `center` }}>
            <TextAreaInput
              placeholder="Enter Dispute Log Message Body" 
              label="" 
              required={false} 
              value={dispute_log_body} 
              height={100}
              onChange={(value) => set_dispute_log_body(value)}
            />

              {/* <View style={{ marginHorizontal: 10 }}></View> */}

            <TouchableOpacity
              style={[(!!dispute_log_image ? StylesConstants.COMMON_STYLES.btnDangerFullWidth : StylesConstants.COMMON_STYLES.btnSecondaryFullWidth), {  }]}
              onPress={() => !!dispute_log_image ? set_dispute_log_image('') : set_add_dispute_log_image_modal_visible(true)}
            >
              <Ionicons name={!!dispute_log_image ? "trash-bin" : "camera"} size={24} color="white" />
            </TouchableOpacity> 
            <ImageUploadModal
              header="Upload Dispute Log Picture"
              visible={add_dispute_log_image_modal_visible}
              set_visible={set_add_dispute_log_image_modal_visible}
              onSubmit={(imageInfo) => { set_dispute_log_image(imageInfo.uri); }}
            />
          </View>

          <View style={{ justifyContent: `center` }}>
            <TouchableOpacity style={[StylesConstants.COMMON_STYLES.btnPrimaryFullWidth, { marginTop: 15 }]} onPress={createDisputeLog}>
              <Text style={StylesConstants.COMMON_STYLES.btnTextWhite}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </CommonModal>

      <FlatList
        style={scrollStyle}
        data={dispute_logs}
        renderItem={(item) => <DisputeLog dispute_log={item.item} index={item.index} />}
        refreshControl={<RefreshControl refreshing={is_refreshing} onRefresh={onRefresh} />}
        keyExtractor={log => log.id.toString()}
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