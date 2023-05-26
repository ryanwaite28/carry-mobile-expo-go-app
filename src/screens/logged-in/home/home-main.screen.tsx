import { StyleSheet, Text, View, TouchableOpacity, Image, RefreshControl, StatusBar, SafeAreaView, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { UserStoreService } from '../../../services/user-store.service';
import { ScrollView } from 'react-native-gesture-handler';
import { getUserFullName, getUserIcon } from '../../../utils/common.utils';
import { StylesConstants } from '../../../services/styles.constants';
import { PageHeader } from '../../../components/page-headers/page-header.component';
import { DeliveryService } from '../../../services/delivery.service';
import { filter, finalize, take } from 'rxjs';
import { useNavigation } from '@react-navigation/native';
import { UsersService } from '../../../services/users.service';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { LoadingScreenComponent } from '../../../components/loading-screen.component';
import { CommonModal } from '../../../components/modal.component';
import { TermsAgreementComponent } from '../../../components/terms-agreement.component';




export function HomeMainScreen(props) {
  const navigation = useNavigation<any>();

  const [you, set_you] = useState(UserStoreService.getLatestState()!);
  const [account_info, set_account_info] = useState({});
  const [terms_modal_visible, set_terms_modal_visible] = useState(false);
  const [is_refreshing, set_is_refreshing] = useState<boolean>(false);
  const [is_subscription_active, set_is_subscription_active] = useState(UserStoreService.is_subscription_active);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [stats, setStats] = useState({
    deliveries_count: 0,
    delivering_completed_count: 0,
    delivering_inprogress_count: 0,
  });

  useEffect(() => {
    UserStoreService.is_subscription_active_stream.subscribe({
      next: (state) => {
        console.log({ prev: is_subscription_active, now: state });
        set_is_subscription_active(state);
      }
    });
  }, [is_subscription_active]);

  useEffect(() => {
    UserStoreService.getChangesObs()
    .pipe(filter((you) => !!you))
    .subscribe({
      next: (you) => {
        console.log(`===== home page you emit:`);
        set_you(you!);
      }
    });
  }, []);

  useEffect(() => {
    DeliveryService.getUserStats(you.id).pipe(take(1)).subscribe({
      next: (response) => {
        console.log(`\n\n`, { response }, `\n\n`);
        if (response.data) {
          setStats(response.data as any);
        }
      }
    });

    UsersService.get_account_info(you.id).subscribe({
      next: (response) => {
        set_account_info(response.data);
      }
    });
  }, []);




  const stripe_login = () => {
    setIsLoading(true);
    UsersService.stripe_login(you.id)
    .pipe(finalize(() => { setIsLoading(false); }))
    .subscribe({
      next: async (response) => {
        const canOpen = await Linking.canOpenURL(response.data.url);
        const browser = await Linking.openURL(response.data.url);
        console.log({ canOpen, browser });
      },
      error: (error) => {
        error?.response?.data?.message && Alert.alert(error?.response?.data?.message);
      }
    });
    
  };

  const openNotificationsScreen = () => {
    // update every time
    console.log(`===== updating last seen notifications`);
    UsersService.update_user_last_opened(you.id)
      .subscribe({
        next: (response: any) => {
          console.log(`===== updated last seen notifications`);
        }
      });

    navigation.navigate(`NotificationsMain`, {});
  };

  const onRefresh = () => {
    set_is_refreshing(true);

    UsersService.get_account_info(you.id).subscribe({
      next: (response) => {
        set_account_info(response.data);
      }
    });

    DeliveryService.getUserStats(you.id)
    .pipe()
    .subscribe({
      next: (response) => {
        console.log(`\n\n`, { response }, `\n\n`);
        if (response.data) {
          setStats(response.data as any);
          set_is_refreshing(false);
        }
      }
    });
  }


  const userIcon = getUserIcon(you);
  const membershipText = is_subscription_active ? `Active` : `Not Active`;
  const membershipTextStyle = is_subscription_active ? styles.membershipTextStyleActive : styles.membershipTextStyleNotActive;

  const account_is_ready = (
    !!you && 
    !!you.stripe_account_id && 
    !!you.stripe_customer_account_id &&
    !!you.stripe_account_verified
  );



  if (isLoading) {
    return (
      <LoadingScreenComponent />
    );
  }

  return (
    <SafeAreaView style={[StylesConstants.COMMON_STYLES.safeAreaViewContainer]}>
      <PageHeader header="Home" />

      <ScrollView style={[styles.scrollView, StylesConstants.COMMON_STYLES.bgGrey]} refreshControl={<RefreshControl refreshing={is_refreshing} onRefresh={onRefresh} />}>
        <View style={[StylesConstants.COMMON_STYLES.infoBoxZeroPaddingMargin, { padding: 10, marginBottom: 10 }]}>
          <View style={[{ flexDirection: 'row', justifyContent: `center`, alignItems: `center` }]}>
            <View style={{ padding: 5, flex: 1, flexDirection: 'column', justifyContent: `center`, alignItems: `center` }}>
              <Image style={styles.userIcon} source={userIcon} />
            </View>
  
            <View style={{ flex: 3, padding: 5 }}>
              <Text style={styles.headerText}>{ getUserFullName(you) }</Text>
              <Text style={styles.usernameText}>@{you.username}</Text>
    
              <View style={styles.userStatus}>
                <View style={styles.alignRow}>
                  <Text style={styles.statusText}>Membership</Text>
                  <Text style={membershipTextStyle}>{membershipText}</Text>
                </View>
              </View>
            </View>
          </View>
          {
            !account_is_ready && (
              <Text style={{ marginTop: 0, padding: 10 }}>
                Account not ready. Go to settings and make sure that your stripe connect account is setup and that at least 1 payment method is on your stripe accoune.
              </Text>
            )
          }
        </View>

        <View style={StylesConstants.COMMON_STYLES.infoBox}>
          <Text style={styles.headerText}>Stats</Text>
          <Text style={{margin: 5}}></Text>
          <Text style={styles.usernameText}>Deliveries Created: {stats.deliveries_count}</Text>
          <Text style={styles.usernameText}>Deliveries Completed: {stats.delivering_completed_count}</Text>
          <Text style={styles.usernameText}>Deliveries In-Progress: {stats.delivering_inprogress_count}</Text>
        </View>

        <TouchableOpacity onPress={() => { openNotificationsScreen(); }}>
          <View style={[StylesConstants.COMMON_STYLES.infoBoxZeroPaddingMargin, { padding: 15, marginBottom: 15 }, StylesConstants.COMMON_STYLES.flexRowSpaceBetweenCenter]}>
            <Text style={{ fontSize: 24 }}>
              Notifications
            </Text>
            <MaterialIcons name="arrow-forward-ios" size={24} color="black" />
          </View>
        </TouchableOpacity>

        {
          account_is_ready && (
            <TouchableOpacity style={[StylesConstants.COMMON_STYLES.btnPrimaryFullWidth, { marginBottom: 15 }]} onPress={stripe_login}>
              <Text style={StylesConstants.COMMON_STYLES.btnTextWhite}>Stripe Account Login</Text>
            </TouchableOpacity>
          )
        }

        <TouchableOpacity style={[StylesConstants.COMMON_STYLES.btnSecondaryFullWidth, { marginBottom: 50 }]} onPress={() => set_terms_modal_visible(true)}>
          <Text style={StylesConstants.COMMON_STYLES.btnTextWhite}>Terms & Agreement</Text>
        </TouchableOpacity>
        <CommonModal
          header="Terms & Agreement"
          modal_visible={terms_modal_visible}
          set_modal_visible={set_terms_modal_visible}
        >
          <TermsAgreementComponent />
        </CommonModal>
  
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
    backgroundColor: 'white',
  },
  scrollView: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },

  userIcon: {
    width: 75,
    height: 75,
    borderRadius: 75,
    // resizeMode: `contain`,
    // aspectRatio: 1,
    // width: `100%`, 
    // marginBottom: 24,
  },

  headerText: {
    fontSize: 16,
    // marginBottom: 4,
  },
  usernameText: {
    fontSize: 12,
    marginBottom: 10,
    color: StylesConstants.MEDIUM_GREY
  },
  alignRow: {
    display: `flex`,
    flexDirection: `row`, 
    justifyContent: `space-between`,
    alignItems: `center` 
  },
  userStatus: {
    backgroundColor: StylesConstants.MEDIUM_LIGHTER_GREY,
    borderRadius: 4,
    padding: 5,
  },
  statusText: {
    padding: 0,
  },
  membershipTextStyleActive: {
    padding: 4,
    color: `white`,
    backgroundColor: `green`,
    borderRadius: 4,
    overflow: 'hidden',
  },
  membershipTextStyleNotActive: {
    padding: 4,
    color: `white`,
    backgroundColor: `red`,
    overflow: 'hidden',
    borderRadius: 4,
  },
  navPressable: {

  },
});
