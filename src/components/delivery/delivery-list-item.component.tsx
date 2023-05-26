import React from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";
import { DeliveryDisputeStatus } from "../../enums/modern.enums";
import { IDelivery } from "../../interfaces/deliverme.interface";
import { disputeTextStyles, StylesConstants } from "../../services/styles.constants";
import { UserStoreService } from "../../services/user-store.service";
import { dateTimeTransform, getDeliveryStatus, timeAgoTransform } from "../../utils/common.utils";




export function DeliveryListItemComponent (props) {
  const delivery: IDelivery = props.delivery;
  const onItemPress = props.onItemPress;

  const datetime = dateTimeTransform(delivery.date_created);
  const timeAgo = timeAgoTransform(delivery.date_created);
  const dateText = `${datetime} (${timeAgo})`;
  const status = getDeliveryStatus(delivery, UserStoreService.getLatestState()!);
  const statusTextStyle = delivery.completed
    ? styles.textDeliveryCompleted
    : delivery.carrier_id
      ? styles.textDeliveryInProgress
      : styles.textDeliveryOpen;


  console.log({ delivery });

  return (
    <TouchableOpacity style={styles.container} onPress={onItemPress}>
      <View style={[StylesConstants.COMMON_STYLES.infoBoxZeroPaddingMargin, { padding: 15, marginBottom: 15 }]}>
        <View style={{  }}>
          <Text style={styles.title}>{ delivery.title }</Text>
          <Text style={StylesConstants.COMMON_STYLES.textWrap}>{ delivery.description }</Text>
          <Text style={styles.otherInfo}>{ dateText }</Text>
        </View>

        <View style={{  }}>
          <Text style={[statusTextStyle, { flexShrink: 1, marginTop: 15 }]}>
            { status.display }
          </Text>

          {
            !!delivery.delivery_dispute && !delivery.completed && (
              <Text style={[disputeTextStyles[delivery.delivery_dispute.status], { flexShrink: 1, marginTop: 15 }]}>
                Dispute: {delivery.delivery_dispute.status}
              </Text>
            )
          }
        </View>
      </View>
    </TouchableOpacity>
  );
}


const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // width: Dimensions.get(`window`).width,
    // height: 100,
  },

  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  description: {
    
  },
  otherInfo: {
    fontSize: 10,
    marginTop: 10,
  },
  bottomBorder: {
    borderBottomColor: StylesConstants.MEDIUM_GREY,
    borderBottomWidth: 0.5,
  },
  topBorder: {
    borderTopColor: StylesConstants.MEDIUM_GREY,
    borderTopWidth: 0.5,
  },

  textDeliveryCompleted: {
    padding: 4,
    color: `white`,
    backgroundColor: `green`,
    borderColor: `green`,
    borderWidth: 0.5,
    borderRadius: 4,
    // overflow: 'hidden',
  },
  textDeliveryInProgress: {
    padding: 4,
    color: `black`,
    backgroundColor: `yellow`,
    borderColor: `gold`,
    borderWidth: 0.5,
    borderRadius: 4,
    // overflow: 'hidden',
  },
  textDeliveryOpen: {
    padding: 4,
    color: `white`,
    backgroundColor: `blue`,
    borderColor: `blue`,
    borderWidth: 0.5,
    borderRadius: 4,
    // overflow: 'hidden',
  },
});
