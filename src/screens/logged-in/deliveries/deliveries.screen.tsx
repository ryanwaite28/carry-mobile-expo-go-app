import { StyleSheet, RefreshControl, View, Text, Image, FlatList, StatusBar, SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { UsersService } from '../../../services/users.service';
import { UserStoreService } from '../../../services/user-store.service';
import { DeliveryService } from '../../../services/delivery.service';
import { AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { IDelivery } from '../../../interfaces/deliverme.interface';
import { DeliveryListItemComponent } from '../../../components/delivery/delivery-list-item.component';
import { LoadingScreenComponent } from '../../../../src/components/loading-screen.component';
import { CreateDeliveryScreen } from './create-delivery.screen';
import { StylesConstants } from '../../../services/styles.constants';
import { renderFlatlistSeparator } from '../../../components/_common.components';
import { finalize } from 'rxjs';
import { PageHeader } from '../../../components/page-headers/page-header.component';
import { LocalEventsService } from '../../../services/local-events.service';



export function DeliveriesMainScreen(props) {
  const navigation = useNavigation<any>();

  const [you, set_you] = useState(UserStoreService.getLatestState()!);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [is_refreshing, set_is_refreshing] = useState<boolean>(false);
  const [deliveries, set_deliveries] = useState<IDelivery[]>([]);

  let min_id: number | undefined = deliveries.length && deliveries[deliveries.length - 1].id;

  useEffect(() => {
    DeliveryService.getUserDeliveries(you.id, min_id).subscribe({
      next: (response) => {
        set_deliveries([...deliveries, ...response.data]);
        setIsLoading(false);
      }
    });
  }, []);

  useEffect(() => {
    const sub = LocalEventsService.DELIVERY_CREATED_EVENTS.subscribe({
      next: () => {
        console.log(`New delivery; refreshing...`);
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

  const openCreateDeliveryScreen = () => {
    navigation.navigate(`CreateDelivery`, {});
  };

  const onRefresh = () => {
    set_is_refreshing(true);
    min_id = undefined;
    DeliveryService.getUserDeliveries(you.id, min_id)
    .pipe(finalize(() => {
      set_is_refreshing(false);
    }))
    .subscribe({
      next: (response) => {
        set_deliveries(response.data);
      }
    });
  }

  const onEndReached = () => {
    if (min_id && min_id <= 1) {
      return;
    }
    setIsLoadingMore(true);
    DeliveryService.getUserDeliveries(you.id, min_id)
    .pipe(finalize(() => {
      setIsLoadingMore(false);
    }))
    .subscribe({
      next: (response) => {
        set_deliveries([...deliveries, ...response.data]);
      }
    });
  };

  return (
    <>
      {
        isLoading ? (
          <LoadingScreenComponent />
        ) : (
          <SafeAreaView style={StylesConstants.COMMON_STYLES.safeAreaViewContainer}>
            <PageHeader header="Your Deliveries">
              <TouchableOpacity onPress={openCreateDeliveryScreen}>
                <AntDesign name="plussquare" size={24} color="black" />
              </TouchableOpacity>
            </PageHeader>

            <View style={[StylesConstants.COMMON_STYLES.bgGrey, { padding: 15, }]}>
              <FlatList
                style={{ marginBottom: 50 }}
                refreshControl={<RefreshControl refreshing={is_refreshing} onRefresh={onRefresh} />}
                data={deliveries}
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
