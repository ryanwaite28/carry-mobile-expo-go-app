import { SafeAreaView, ScrollView, Text, View, StyleSheet, Image, TouchableOpacity } from "react-native";
import { IDelivery, IDeliveryDispute } from "../../../interfaces/deliverme.interface";
import { StylesConstants } from "../../../services/styles.constants";
import { PageHeader } from '../../../components/page-headers/page-header.component';
import { MaterialIcons } from '@expo/vector-icons';
import { PageHeaderBack } from '../../../components/page-headers/page-header-back.component';
import { getUserFullName, getUserIconOrAnon } from "../../../utils/common.utils";
import React, { useEffect, useRef, useState } from 'react';
import { LoadingScreenComponent } from '../../../components/loading-screen.component';
import { DeliveryService } from "../../../services/delivery.service";
import { finalize } from "rxjs";
import { useNavigation } from "@react-navigation/native";



export function DisputePreviousCustomerSupportAgentsComponent (props) {
  const navigation = useNavigation<any>();
  const delivery: IDelivery = props.delivery;
  const dispute: IDeliveryDispute = props.route.params.dispute;
  const header: string = props.header;


  const [isLoading, setIsLoading] = useState<boolean>(false);



  // Handlers

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

      <ScrollView style={{ padding: 10 }}>
        
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