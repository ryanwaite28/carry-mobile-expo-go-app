import { RefreshControl, View, Text, FlatList, SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { UserStoreService } from '../../../services/user-store.service';
import { DeliveryService } from '../../../services/delivery.service';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { IDelivery } from '../../../interfaces/deliverme.interface';
import { DeliveryListItemComponent } from '../../../components/delivery/delivery-list-item.component';
import { LoadingScreenComponent } from '../../../../src/components/loading-screen.component';
import { StylesConstants } from '../../../services/styles.constants';
import { renderFlatlistSeparator } from '../../../components/_common.components';
import { PageHeader } from '../../../components/page-headers/page-header.component';
import { finalize } from 'rxjs';
import { LocalEventsService } from '../../../services/local-events.service';



export function DeliveringMainScreen(props) {
  const navigation = useNavigation<any>();

  const [you, set_you] = useState(UserStoreService.getLatestState()!);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [is_refreshing, set_is_refreshing] = useState<boolean>(false);
  const [delivering, set_delivering] = useState<IDelivery[]>([]);

  let min_id: number | undefined = delivering.length && delivering[delivering.length - 1].id;

  useEffect(() => {
    DeliveryService.getUserDelivering(you.id).subscribe({
      next: (response) => {
        set_delivering([...delivering, ...response.data]);
        setIsLoading(false);
      }
    });
  }, []);

  useEffect(() => {
    const sub = LocalEventsService.DELIVERY_CLAIMED_EVENTS.subscribe({
      next: () => {
        console.log(`Deliverings Screen: new delivery claimed`);
        onRefresh();
      }
    });

    return () => {
      sub?.unsubscribe();
    };
  }, []);

  const openDeliveryScreen = (delivery: IDelivery) => {
    navigation.navigate(`DeliveryScreen`, { delivery });
  };

  const openPastDeliveringScreen = () => {
    navigation.navigate(`DeliveringPast`, {});
  };

  const onRefresh = () => {
    set_is_refreshing(true);
    min_id = undefined;
    DeliveryService.getUserDelivering(you.id).subscribe({
      next: (response) => {
        set_delivering(response.data);
        set_is_refreshing(false);
      }
    });
  }

  const onEndReached = () => {
    // 10/5/2022 - all is loaded instead of paginating/async loading

    // if (min_id && min_id <= 1) {
    //   console.log(`end already reached...`);
    //   return;
    // }
    // setIsLoadingMore(true);
    // DeliveryService.getUserDelivering(you.id, min_id)
    // .pipe(finalize(() => {
    //   setIsLoadingMore(false);
    // }))
    // .subscribe({
    //   next: (response) => {
    //     console.log({ delivering: response.data, min_id });
    //     set_delivering([...delivering, ...response.data]);
    //   }
    // });
  };

  return (
    <>
      {
        isLoading ? (
          <LoadingScreenComponent />
        ) : (
          <SafeAreaView style={[StylesConstants.COMMON_STYLES.safeAreaViewContainer]}>
            <PageHeader header="Your Delivering">
              <TouchableOpacity onPress={openPastDeliveringScreen}>
                <MaterialCommunityIcons name="clock-time-eight" size={24} color="black" />
              </TouchableOpacity>
            </PageHeader>

            <View style={[StylesConstants.COMMON_STYLES.bgGrey, { padding: 15, }]}>
              <FlatList
                style={{ marginBottom: 50 }}
                refreshControl={<RefreshControl refreshing={is_refreshing} onRefresh={onRefresh} />}
                data={delivering}
                keyExtractor={delivery => delivery.id.toString()}
                renderItem={(item) => <DeliveryListItemComponent {...props} delivery={item.item} onItemPress={() => openDeliveryScreen(item.item)} />}
                ItemSeparatorComponent={() => <></>}
                ListFooterComponent={<ActivityIndicator animating={isLoadingMore} />}
                onEndReached={onEndReached}
                ListEmptyComponent={
                  <View style={[StylesConstants.COMMON_STYLES.flexCenter, { height: 250 }]}>
                    <Text style={{ color: StylesConstants.MEDIUM_GREY }}>None for now</Text>
                  </View>
                }
              />
            </View>
          </SafeAreaView>
        )
      }
    </>
  );
}
