import { SafeAreaView, View, FlatList, RefreshControl, ActivityIndicator, Text, TouchableOpacity, Modal, ScrollView, Image, Alert, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { IDelivery, IDeliveryMessage } from '../../interfaces/deliverme.interface';
import { StylesConstants } from '../../services/styles.constants';
import { PageHeader } from '../../components/page-headers/page-header.component';
import { PageHeaderBack } from '../../components/page-headers/page-header-back.component';
import React, { useEffect, useRef, useState } from 'react';
import { DeliveryService } from '../../services/delivery.service';
import { UserStoreService } from '../../services/user-store.service';
import { Ionicons } from '@expo/vector-icons';
import { dateTimeTransform, getUserFullName, getUserIcon, timeAgoTransform } from '../../utils/common.utils';
import { UsersService } from '../../services/users.service';
import { TextAreaInput } from '../inputs/textarea.component';
import * as Location from 'expo-location';
import { LoadingScreenComponent } from '../loading-screen.component';
import * as ImagePicker from 'expo-image-picker';
import { IFormSubmitEvent } from '../../interfaces/_common.interface';
import { finalize } from 'rxjs';
import { IUser } from '../../interfaces/user.interface';



const Message = (props) => {
  const message: IDeliveryMessage = props.message;
  const you: IUser = props.you;
  const userIcon = getUserIcon(message.user!);

  return (
    <View style={[StylesConstants.COMMON_STYLES.infoBoxZeroPaddingMargin, { margin: 10, padding: 15 }]}>
      {
        you.id === message.user_id ? (
          <>
            <View style={[StylesConstants.COMMON_STYLES.flexRow, { alignItems: `center`, justifyContent: `flex-end` }]}>
              <View style={{ marginRight: 10 }}>
                <Text style={styles.headerText}>{ getUserFullName(message.user!) }</Text>
                <Text style={styles.usernameText}>@{message.user!.username}</Text>
              </View>
              <Image style={StylesConstants.COMMON_STYLES.userIcon} source={userIcon} />
            </View>
  
            <View style={{ marginTop: 15 }}>
              <Text style={{ fontSize: 24, width: `100%`, textAlign: `right` }}>{ message.body }</Text>
              <Text style={{ fontSize: 12, width: `100%`, textAlign: `right` }}>
                { dateTimeTransform(message.created_at) + ' (' + timeAgoTransform(message.created_at) + ')' }
              </Text>
            </View>
          </>
        ) : (
          <>
            <View style={[StylesConstants.COMMON_STYLES.flexRow, { alignItems: `center` }]}>
              <Image style={StylesConstants.COMMON_STYLES.userIcon} source={userIcon} />
              <View style={{ marginLeft: 10, flex: 1, justifyContent: `center` }}>
                <Text style={styles.headerText}>{ getUserFullName(message.user!) }</Text>
                <Text style={styles.usernameText}>@{message.user!.username}</Text>
              </View>
            </View>
  
            <View style={{ marginTop: 15 }}>
              <Text style={{ fontSize: 24 }}>{ message.body }</Text>
              <Text style={{ fontSize: 12, marginVertical: 10 }}>
                { dateTimeTransform(message.created_at) + ' (' + timeAgoTransform(message.created_at) + ')' }
              </Text>
            </View>
          </>
        )
      }
    </View>
  );
};

export function DeliveryMessagesComponent(props) {
  const delivery: IDelivery = props.route.params.delivery;
  console.log({ messages: delivery.deliverme_delivery_tracking_updates });
  
  const listElmRef = useRef(null);
  const [you, set_you] = useState(UserStoreService.getLatestState()!);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [endReached, setEndReached] = useState<boolean>(false);
  const [is_refreshing, set_is_refreshing] = useState<boolean>(false);
  const [send_message_modal_visible, set_send_message_modal_visible] = useState<boolean>(false);
  const [new_message, set_new_message] = useState<string>('');

  const isCarrier = !!delivery.carrier_id && you.id === delivery.carrier_id;

  const [messages, set_messages] = useState<IDeliveryMessage[]>(delivery.delivery_messages!);
  let min_id: number | undefined = messages[messages.length - 1]?.id;

  const onRefresh = () => {
    set_is_refreshing(true);
    min_id = undefined;
    DeliveryService.get_delivery_by_id(delivery.id).subscribe({
      next: (response) => {
        Object.assign(delivery, response.data);
        set_messages(delivery.delivery_messages!);
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

  const sendNewMessage = () => {
    const payload = { body: new_message, delivery_id: delivery.id };

    setIsLoading(true);
    DeliveryService.sendDeliveryMessage(payload)
    .pipe(finalize(() => { setIsLoading(false); }))
    .subscribe({
      next: (response) => {
        Alert.alert(response.message!);
        set_new_message('');
        onRefresh();
        set_send_message_modal_visible(false);
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
      <PageHeaderBack header="Messages">
        {
          !delivery.completed && (
            <TouchableOpacity style={{ marginRight: 25 }} onPress={() => { set_send_message_modal_visible(true); }}>
              <Ionicons name="md-add-circle-sharp" size={24} color="black" />
            </TouchableOpacity>
          )
        }
      </PageHeaderBack>

      <View style={StylesConstants.COMMON_STYLES.bgGrey}>

        <FlatList
          ref={listElmRef}
          refreshControl={<RefreshControl refreshing={is_refreshing} onRefresh={onRefresh} />}
          data={messages}
          keyExtractor={tracking_update => tracking_update.id.toString()}
          renderItem={(item) => <Message message={item.item} you={you} />}
          ItemSeparatorComponent={() => <></>}
          ListFooterComponent={<ActivityIndicator animating={isLoadingMore} />}
          onEndReached={onEndReached}
          ListEmptyComponent={
            <View style={[StylesConstants.COMMON_STYLES.flexCenter, { height: 250 }]}>
              <Text style={{ color: StylesConstants.MEDIUM_GREY }}>None</Text>
            </View>
          }
        />

        <Modal visible={send_message_modal_visible} animationType="slide">
          <SafeAreaView style={StylesConstants.COMMON_STYLES.safeAreaViewContainer}>
            <PageHeader header="Send Delivery Message">
              <TouchableOpacity style={{ marginLeft: 25 }} onPress={() => { set_send_message_modal_visible(false); }}>
                <Ionicons name="md-return-up-back-outline" size={24} color="black" />
              </TouchableOpacity>
            </PageHeader>

            <ScrollView style={[StylesConstants.COMMON_STYLES.bgGrey, { padding: 10 }]}>
              <View style={[StylesConstants.COMMON_STYLES.infoBoxZeroPaddingMargin, { padding: 15 }]}>
                <TextAreaInput
                  placeholder="Enter New Message"
                  label="Message"
                  required={true}
                  numberOfLines={5}
                  value={new_message}
                  onChange={(value) => set_new_message(value)} />

                <TouchableOpacity style={[StylesConstants.COMMON_STYLES.btnSecondaryFullWidth, { marginTop: 10 }]} onPress={sendNewMessage}>
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
