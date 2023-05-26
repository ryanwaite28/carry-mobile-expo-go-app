import { SafeAreaView, ScrollView, Text, View, StyleSheet, Image, TouchableOpacity, RefreshControl, Alert } from "react-native";
import { IDelivery, IDeliveryDispute } from "../../../interfaces/deliverme.interface";
import { StylesConstants } from "../../../services/styles.constants";
import { PageHeader } from '../../../components/page-headers/page-header.component';
import { MaterialIcons } from '@expo/vector-icons';
import { PageHeaderBack } from '../../../components/page-headers/page-header-back.component';
import { getUserFullName, getUserIconOrAnon } from "../../../utils/common.utils";
import React, { useEffect, useState } from "react";
import { LoadingScreenComponent } from '../../../components/loading-screen.component';
import { DeliveryService } from "../../../services/delivery.service";
import { finalize } from "rxjs";
import { useNavigation } from "@react-navigation/native";





export function DisputeMainComponent (props) {
  const navigation = useNavigation<any>();
  const delivery: IDelivery = props.delivery;
  const header: string = props.header;


  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dispute, set_dispute] = useState<IDeliveryDispute>(delivery.delivery_dispute!);
  const [is_refreshing, set_is_refreshing] = useState<boolean>(false);


  useEffect(() => {
    DeliveryService.get_delivery_dispute_info_by_delivery_id(delivery.id)
    .pipe(finalize(() => { setIsLoading(false); }))
    .subscribe({
      next: (response) => {
        set_dispute(response.data!);
      },
      error: (error) => {
        error.response?.data?.message && Alert.alert(error.response?.data?.message);
      }
    })
  }, []);



  // Handlers

  const onRefresh = () => {
    set_is_refreshing(true);
    DeliveryService.get_delivery_dispute_info_by_delivery_id(delivery.id)
    .pipe(finalize(() => { set_is_refreshing(false); }))
    .subscribe({
      next: (response) => {
        set_dispute(response.data!);
      },
      error: (error) => {
        error.response?.data?.message && Alert.alert(error.response?.data?.message);
      }
    })
  }

  const navToPage = (page) => {
    navigation.navigate(page, { delivery, dispute });
  };



  if (isLoading) {
    return (
      <LoadingScreenComponent />
    );
  }

  return (
    <SafeAreaView style={StylesConstants.COMMON_STYLES.safeAreaViewContainer}>
      <PageHeaderBack header={header} />

      <ScrollView style={{ padding: 10 }} refreshControl={<RefreshControl refreshing={is_refreshing} onRefresh={onRefresh} />}>

      <View style={{ padding: 20, marginBottom: 20 }}>
        <Text style={{ fontSize: 20, marginBottom: 10 }}>
          Hold on tight, we're here to help.  
        </Text>
      </View>
      
      <View style={StylesConstants.COMMON_STYLES.infoBox}>
        {
          !dispute.agent ? (
            <Text style={{ fontSize: 12, marginBottom: 10 }}>
              No assigned customer service agent yet. 
            </Text>
          ) : (
            <>
              <Text style={{ fontSize: 12, marginBottom: 10 }}>
                Customer Agent
              </Text>
              <View style={[StylesConstants.COMMON_STYLES.flexRow, { alignItems: `center` }]}>
                <Image style={StylesConstants.COMMON_STYLES.userIcon} source={getUserIconOrAnon(dispute.agent)} />
                <View style={{ marginLeft: 10, flex: 1, justifyContent: `center` }}>
                  <Text style={styles.headerText}>{ getUserFullName(dispute.agent) }</Text>
                </View>
              </View>
            </>
          )
        }
      </View>

      <View style={[StylesConstants.COMMON_STYLES.infoBox]}>
        <Text style={{padding: 15, fontSize: 36}}>Created By</Text>
        <View style={[StylesConstants.COMMON_STYLES.flexRow, { alignItems: `center`, padding: 15, marginBottom: 15 }]}>
          <Image style={StylesConstants.COMMON_STYLES.userIcon} source={getUserIconOrAnon(dispute.creator)} />
          <View style={{ marginLeft: 10, flex: 1, justifyContent: `center` }}>
            <Text style={styles.headerText}>{ getUserFullName(delivery.carrier!) }</Text>
            <Text style={styles.usernameText}>@{delivery.carrier!.username}</Text>
          </View>
        </View>
      </View>

      <View style={StylesConstants.COMMON_STYLES.infoBox}>
        <Text style={{padding: 15, fontSize: 36}}>Info</Text>
        <Text style={{ fontSize: 20, marginBottom: 10 }}>{ dispute.title }</Text>
        <Text style={{ fontSize: 12, marginBottom: 10 }}>{ dispute.details }</Text>
        {!!dispute.image_link && <Image style={{ width: 200, height: 200, marginTop: 15 }} source={{ uri: dispute.image_link }} />}
      </View>


      {/* Nav to other screens */}

      <TouchableOpacity onPress={() => { navToPage(`DisputeLogs`); }}>
        <View style={[StylesConstants.COMMON_STYLES.listItem, { padding: 15 }, StylesConstants.COMMON_STYLES.flexRowSpaceBetweenCenter]}>
          <Text style={{ fontSize: 12 }}>Logs</Text>
          <MaterialIcons name="arrow-forward-ios" size={24} color="black" />
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => { navToPage(`DisputeCustomerSupportMessages`); }}>
        <View style={[StylesConstants.COMMON_STYLES.listItem, { padding: 15 }, StylesConstants.COMMON_STYLES.flexRowSpaceBetweenCenter]}>
          <Text style={{ fontSize: 12 }}>Customer Support Messages</Text>
          <MaterialIcons name="arrow-forward-ios" size={24} color="black" />
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => { navToPage(`DisputeSettlementOffers`); }}>
        <View style={[StylesConstants.COMMON_STYLES.listItemEnd, { padding: 15 }, StylesConstants.COMMON_STYLES.flexRowSpaceBetweenCenter]}>
          <Text style={{ fontSize: 12 }}>Settlement Offers</Text>
          <MaterialIcons name="arrow-forward-ios" size={24} color="black" />
        </View>
      </TouchableOpacity>

        <View style={{ marginBottom: 20 }}></View>
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
});