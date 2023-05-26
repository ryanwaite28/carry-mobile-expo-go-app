import { RefreshControl, View, Text, FlatList, SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { UserStoreService } from '../../../services/user-store.service';
import { DeliveryService } from '../../../services/delivery.service';
import { useNavigation } from '@react-navigation/native';
import { IDelivery } from '../../../interfaces/deliverme.interface';
import { DeliveryListItemComponent } from '../../../components/delivery/delivery-list-item.component';
import { LoadingScreenComponent } from '../../../../src/components/loading-screen.component';
import { StylesConstants } from '../../../services/styles.constants';
import { renderFlatlistSeparator } from '../../../components/_common.components';
import { PageHeaderBack } from '../../../components/page-headers/page-header-back.component';
import { finalize } from 'rxjs';



export function DeliveringPastMainScreen(props) {
  const navigation = useNavigation<any>();

  const [you, set_you] = useState(UserStoreService.getLatestState()!);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [is_refreshing, set_is_refreshing] = useState<boolean>(false);
  const [delivering, set_delivering] = useState<IDelivery[]>([]);

  let min_id: number | undefined = delivering.length && delivering[delivering.length - 1].id;

  useEffect(() => {
    DeliveryService.getUserPastDeliverings(you.id, min_id).subscribe({
      next: (response) => {
        set_delivering([...delivering, ...response.data]);
        setIsLoading(false);
      }
    });
  }, []);

  const openDeliveryScreen = (delivery: IDelivery) => {
    navigation.navigate(`DeliveryScreen`, { delivery });
  };

  const onRefresh = () => {
    set_is_refreshing(true);
    min_id = undefined;
    DeliveryService.getUserPastDeliverings(you.id)
    .pipe(finalize(() => {
      set_is_refreshing(false);
    }))
    .subscribe({
      next: (response) => {
        set_delivering(response.data);
      }
    });
  }

  const onEndReached = () => {
    if (min_id && min_id <= 1) {
      return;
    }
    setIsLoadingMore(true);
    DeliveryService.getUserPastDeliverings(you.id, min_id)
    .pipe(finalize(() => {
      setIsLoadingMore(false);
    }))
    .subscribe({
      next: (response) => {
        set_delivering([...delivering, ...response.data]);
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
            <PageHeaderBack header="Your Past Delivering" />

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
                  <View style={[StylesConstants.COMMON_STYLES.flexCenter, { height: 150 }]}>
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
