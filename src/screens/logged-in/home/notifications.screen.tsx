import { StyleSheet, RefreshControl, View, Text, Image, FlatList, StatusBar, SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { UsersService } from '../../../services/users.service';
import { UserStoreService } from '../../../services/user-store.service';
import { DeliveryService } from '../../../services/delivery.service';
import { AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { IDelivery } from '../../../interfaces/deliverme.interface';
import { DeliveryListItemComponent } from '../../../components/delivery/delivery-list-item.component';
import { LoadingScreenComponent } from '../../../../src/components/loading-screen.component';
import { StylesConstants } from '../../../services/styles.constants';
import { renderFlatlistSeparator } from '../../../components/_common.components';
import { finalize } from 'rxjs';
import { PageHeader } from '../../../components/page-headers/page-header.component';
import { INotification } from '../../../interfaces/_common.interface';
import { PageHeaderBack } from '../../../components/page-headers/page-header-back.component';
import { dateTimeTransform, getUserIcon, getUserIconOrAnon, timeAgoTransform } from '../../../utils/common.utils';



export function NotificationsMainScreen(props) {
  const navigation = useNavigation<any>();

  const [you, set_you] = useState(UserStoreService.getLatestState()!);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [is_refreshing, set_is_refreshing] = useState<boolean>(false);
  const [notifications, set_notifications] = useState<INotification[]>([]);

  let min_id: number | undefined = notifications.length && notifications[notifications.length - 1].id;

  useEffect(() => {
    UsersService.getUserNotifications(you.id, min_id).subscribe({
      next: (response) => {
        set_notifications([...notifications, ...response.data]);
        setIsLoading(false);
      }
    });
  }, []);

  const openDeliveryScreen = (delivery: IDelivery) => {
    navigation.navigate(`DeliveryScreen`, { delivery });
  };

  const openCreateDeliveryScreen = () => {
    navigation.navigate(`CreateDelivery`, {});
  };

  const onRefresh = () => {
    set_is_refreshing(true);
    UsersService.getUserNotifications(you.id, 0)
    .pipe(finalize(() => {
      set_is_refreshing(false);
    }))
    .subscribe({
      next: (response) => {
        set_notifications(response.data);
      }
    });
  }

  const onEndReached = () => {
    if (min_id && min_id <= 1) {
      return;
    }
    setIsLoadingMore(true);
    UsersService.getUserNotifications(you.id, min_id)
    .pipe(finalize(() => {
      setIsLoadingMore(false);
    }))
    .subscribe({
      next: (response) => {
        set_notifications([...notifications, ...response.data]);
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
      <PageHeaderBack header="Notifications" />

      <View style={[StylesConstants.COMMON_STYLES.bgGrey, { padding: 15, }]}>
        <FlatList
          style={{ marginBottom: 55 }}
          refreshControl={<RefreshControl refreshing={is_refreshing} onRefresh={onRefresh} />}
          data={notifications}
          keyExtractor={notification => notification.id.toString()}
          renderItem={(item) => (
            <View style={[StylesConstants.COMMON_STYLES.infoBoxZeroPaddingMargin, { padding: 15, marginBottom: 15 }]}>
              <View style={{ flexDirection: `row` }}>
                <View style={{ flex: 1 }}>
                  <Image style={StylesConstants.COMMON_STYLES.userIconSm} source={getUserIconOrAnon(item.item.from!)} />
                </View>
                <View style={{ flex: 4 }}>
                  <Text>{item.item.message}</Text>
                  <Text style={{ marginTop: 10, fontSize: 11, fontStyle: 'italic', color: StylesConstants.MEDIUM_GREY }}>
                    {dateTimeTransform(item.item.created_at)} ({timeAgoTransform(item.item.created_at)})
                  </Text>
                </View>
              </View>
            </View>
          )}
          ItemSeparatorComponent={() => <></>}
          ListFooterComponent={<ActivityIndicator animating={isLoadingMore} />}
          onEndReached={onEndReached}
          ListEmptyComponent={
            <View style={[StylesConstants.COMMON_STYLES.flexCenter, { height: 250 }]}>
              <Text style={{ color: StylesConstants.MEDIUM_GREY }}>None for now</Text>
            </View>
          }
        />

        <View style={{ }}></View>
      </View>

    </SafeAreaView>
  );
}
