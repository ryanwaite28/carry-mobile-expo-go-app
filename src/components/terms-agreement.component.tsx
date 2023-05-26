import { View, Text, StyleSheet, Linking } from "react-native";
import React from "react";
import { Ionicons } from '@expo/vector-icons';
import { StylesConstants } from "../services/styles.constants";
import { PageHeader } from '../components/page-headers/page-header.component';


export function TermsAgreementComponent(props) {
  return (
    <View>
      <View style={sectionContainer}>
        <Text style={styles.sectionText}>Introduction</Text>

        <Text style={styles.headerText}>What is Carry?</Text>
        <Text style={styles.paragraphText}>
          Carry, Inc. (or simply Carry) is a shipping/transportation as a service platform, allowing users to become their own shipping/transportation provider similar to UPS, FedEx, etc. 
          A user can request an item to be transported from one location to another; another user of the platform can fulfill that request.
        </Text>
        
        <Text style={styles.headerText}>Why Carry?</Text>
        <Text style={styles.paragraphText}>
          Carry seeks to provide the speed and efficiency of moving items by leveraging available people in the community via the convenience of a platform, 
          readily accessible on your smartphone. Some of the core scenarios Carry want to address:
        </Text>
        <Text style={styles.paragraphText}>- You left something somewhere and you don't want to make a trip to get it and another trip to come back</Text>
        <Text style={styles.paragraphText}>- You need something taken somewhere but don't have the time to do it</Text>
        <Text style={styles.paragraphText}>- You ordered something online in the same city as you and don't want to wait for days via UPS or FedEx or even Amazon next day delivery</Text>
        <Text style={styles.paragraphText}>
          Essentially, Carry is a new community-based item/package shipping and transportation option.
        </Text>
      </View>
      
      <View style={sectionContainer}>
        <Text style={styles.sectionText}>Terms of Use</Text>

        <Text style={styles.paragraphText}>- All users of the app must have their identities verified.</Text>
        <Text style={styles.paragraphText}>- No illegal substances should be listed as items to transport. We urge users to have honesty and integrity while using the platform.</Text>
        <Text style={styles.paragraphText}>- No stealing will be tolerated, legal intervention will take place in any such event.</Text>
        <Text style={styles.paragraphText}>- All carriers (a user who is fulfilling a delivery) should communicate with the delivery owner and complete the run in a timely manner</Text>
      </View>

      <View style={sectionContainer}>
        <Text style={styles.sectionText}>Privacy Policy</Text>
        <Text style={styles.paragraphText}>- The platform uses <Text style={{color: 'blue'}} onPress={() => Linking.openURL('http://stripe.com')}>Stripe</Text> to process and manage all finance and payment activity; it does not keep or maintain any personal finance information such as bank accounts, credit/debit cards, etc.</Text>
        <Text style={styles.paragraphText}>- The platform does not sell any user data; all information within the app exists only within the app.</Text>
        <Text style={styles.paragraphText}>- Users will only see information pertaining to their job-related functions within the app.</Text>
        <Text style={styles.paragraphText}>- Users will not share/disclose personal information about deliveries they provide. This includes but is not limited to: addresses, names, etc.</Text>
      </View>

      <View style={sectionContainer}>
        <Text style={styles.sectionText}>Right to Make Changes</Text>
        <Text style={styles.paragraphText}>
          Carry reserves/exercises the right to make changes to the terms and agreements.
        </Text>
      </View>

      <View style={sectionContainer}>
        <Text style={styles.sectionText}>Contact</Text>
        <Text style={styles.paragraphText}>For all questions and concerns, please send an email to: <Text style={{color: 'blue'}} onPress={() => Linking.openURL('mailto:business@ryanmyronwaite.com')}>business@ryanmyronwaite.com</Text></Text>
      </View>

      <View style={{ marginBottom: 20 }}></View>
    </View>
  );
}


const sectionContainer = [
  StylesConstants.COMMON_STYLES.infoBoxZeroPaddingMargin,
  {
    marginBottom: 10,
    padding: 10
  }
];

const styles = StyleSheet.create({
  sectionText: {
    fontSize: 24,
    marginVertical: 15,
  },
  headerText: {
    fontSize: 18,
    marginVertical: 10,
  },
  paragraphText: {
    fontSize: 12,
    marginVertical: 10,
  }
});