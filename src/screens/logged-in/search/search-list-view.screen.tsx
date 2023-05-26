import { StyleSheet, Alert, View, TouchableOpacity, Image, FlatList, SafeAreaView, Dimensions, RefreshControl, ActivityIndicator, Text, ScrollView } from 'react-native';
import React, { useRef, useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { getBoundByRegion, getUserFullName } from '../../../utils/common.utils';
import { StylesConstants } from '../../../services/styles.constants';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PageHeader } from '../../../components/page-headers/page-header.component';
import { PageHeaderBack } from '../../../components/page-headers/page-header-back.component';
import { Ionicons } from '@expo/vector-icons';
import { DeliveryListItemComponent } from '../../../components/delivery/delivery-list-item.component';
import MapView, { Marker, Region } from 'react-native-maps';
import { LoadingScreenComponent } from '../../../components/loading-screen.component';
import * as Location from 'expo-location';
import { FontAwesome } from '@expo/vector-icons';
import { DeliveryService } from '../../../services/delivery.service';
import { finalize } from 'rxjs';
import { ServiceMethodResultsInfo } from '../../../interfaces/_common.interface';
import { IDelivery } from '../../../interfaces/deliverme.interface';
import { useNavigation } from '@react-navigation/native';
import { renderFlatlistSeparator } from '../../../components/_common.components';
import { UsersService } from '../../../services/users.service';
import { SelectInput } from '../../../components/inputs/select.component';
import { getCitySelectInputItemsByState, statesSelectInputItems } from '../../../utils/cities-by-state';
import { UserStoreService } from '../../../services/user-store.service';




export function SearchListViewScreen() {
  const navigation = useNavigation<any>();

  const mapRef = useRef<MapView>(null);
  const you = UserStoreService.getLatestState()!;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [resultsLoading, setResultsLoading] = useState<boolean>(false);
  const [location, set_location] = useState<Location.LocationObject | null>(null);
  
  const [from_state, set_from_state] = useState<string>('');
  const [from_city, set_from_city] = useState<string>('');
  const [to_state, set_to_state] = useState<string>('');
  const [to_city, set_to_city] = useState<string>('');
  
  const [coordinates, set_coordinates] = useState<any>(null);
  const [deliveries, set_deliveries] = useState<IDelivery[] | null>(null);
  const [list_view_modal_visible, set_list_view_modal_visible] = useState<boolean>(false);
  const [delivery_view_modal_visible, set_delivery_view_modal_visible] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [is_refreshing, set_is_refreshing] = useState<boolean>(false);
  const [lastRendered, setLastRendered] = useState<number>(Date.now());

  // useEffect(() => {
  //   if (!location) {
  //     return;
  //   }
  //   UsersService.get_location_via_coordinates(location?.coords.latitude, location?.coords.longitude)
  //   .subscribe({
  //     next: (response) => {
  //       set_current_location(response.data!);
  //     },
  //     error: () => {
  //       Alert.alert(`Could not get current location...`);
  //     }
  //   });
  // }, [location]);

  const ask_for_location = async () => {
    Alert.alert(
      "Get current location",
      "This will switch to your current location",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        {
          text: "OK",
          onPress: get_current_location,
        }
      ]
    );
  };
  
  const get_current_location = async () => {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== 'granted') {
      setIsLoading(false);
      Alert.alert('Permission to access location was denied');
      return;
    }
    setIsLoading(true);
    const locationResults = await Location.getCurrentPositionAsync({});
    set_location(locationResults);
    setIsLoading(false);
  };

  const refreshAvailableView = () => {
    set_deliveries([]);

    setResultsLoading(true);
    DeliveryService.searchDeliveries({
      you_id: you.id,
      from_city,
      from_state,
      to_city,
      to_state,
    })
    .pipe(finalize(() => { setResultsLoading(false); }))
    .subscribe({
      next: (response: ServiceMethodResultsInfo<IDelivery[]>) => {
        // if (!response.data!.length) {
        //   Alert.alert(`No results...`);
        //   return;
        // }
        
        console.log(`results:`, response.data);
        set_deliveries(response.data!);
      },
    });
  };

  const handleRegionChange = (region: Region) => {
    const results = getBoundByRegion(region);
    const coordinates = {
      northEast: {
        lat: results.neLat,
        lng: results.neLng,
      },
      southWest: {
        lat: results.swLat,
        lng: results.swLng,
      },
    };

    set_coordinates(coordinates);
  };

  const handleMapReady = async () => {
    console.log(`map ready:`, { current: mapRef.current });
    const bounds = await mapRef.current?.getMapBoundaries();
    if (bounds) {
      set_coordinates({
        northEast: {
          lat: bounds.northEast.latitude,
          lng: bounds.northEast.longitude,
        },
        southWest: {
          lat: bounds.southWest.latitude,
          lng: bounds.southWest.longitude,
        },
      });
    }
  };

  const onClaim = (delivery: IDelivery) => {
    set_deliveries(deliveries!.filter(d => d.id !== delivery.id));
    navigation.navigate(`Delivering`, {});
  }

  const openDeliveryScreen = (delivery: IDelivery) => {
    console.log(`navigating to open delivery`,  delivery);
    navigation.navigate(`DeliveryPreviewScreen`, { delivery });
  };

  if (isLoading) {
    return (
      <LoadingScreenComponent />
    );
  }

  return (
    <SafeAreaView style={StylesConstants.COMMON_STYLES.safeAreaViewContainer}>
      <PageHeader header="Search List View">
        <TouchableOpacity style={{ marginLeft: 25 }} onPress={() => { navigation.goBack(); }}>
          <Ionicons name="md-return-up-back-outline" size={24} color="black" />
        </TouchableOpacity>
      </PageHeader>

      <ScrollView style={[StylesConstants.COMMON_STYLES.bgGrey, { padding: 15 }]}>
        <View style={StylesConstants.COMMON_STYLES.flexRowSpaceBetween}>
          <View style={{ width: `48%` }}>
            <SelectInput
              placeholder="From State"
              label="Select From State"
              items={statesSelectInputItems}
              value={from_state}
              onChange={(value) => set_from_state(value)} />
          </View>
          {
            !!from_state && (
              <View style={{ width: `48%` }}>
                <SelectInput
                  placeholder="From City"
                  label="Select From City"
                  items={getCitySelectInputItemsByState(from_state)}
                  value={from_city}
                  onChange={(value) => set_from_city(value)} />
              </View>
            )
          }
        </View>

        <View style={StylesConstants.COMMON_STYLES.flexRowSpaceBetween}>
          <View style={{ width: `48%` }}>
            <SelectInput
              placeholder="To State"
              label="Select To State"
              items={statesSelectInputItems}
              value={to_state}
              onChange={(value) => set_to_state(value)} />
          </View>
          {
            !!to_state && (
              <View style={{ width: `48%` }}>
                <SelectInput
                  placeholder="To City"
                  label="Select To City"
                  items={getCitySelectInputItemsByState(to_state)}
                  value={to_city}
                  onChange={(value) => set_to_city(value)} />
              </View>
            )
          }
        </View>

        <TouchableOpacity style={StylesConstants.COMMON_STYLES.btnSecondaryFullWidth} onPress={refreshAvailableView}>
          <Text style={StylesConstants.COMMON_STYLES.btnTextWhite}>Search</Text>
        </TouchableOpacity>

        {
          resultsLoading && (
            <View style={{ margin: 50 }}>
              <ActivityIndicator animating={true} />
            </View>
          )
        }

        <View style={{ marginTop: 50, marginBottom: 25 }}>
          {
            !!deliveries && !!deliveries.length && (
              deliveries.map((delivery) => (
                <DeliveryListItemComponent
                  delivery={delivery}
                  onItemPress={() => openDeliveryScreen(delivery)} 
                />
              ))
            )
          }

          {
            !!deliveries && !deliveries.length && (
              <Text>No results...</Text>
            )
          }
        </View>
      </ScrollView>

      

      {/* <View style={StylesConstants.COMMON_STYLES.bgGrey}>
        <FlatList
          style={{ marginBottom: 50 }}
          refreshControl={<RefreshControl refreshing={is_refreshing} onRefresh={refreshAvailableView} />}
          data={deliveries}
          keyExtractor={delivery => delivery.id.toString()}
          renderItem={(item) => <DeliveryListItemComponent delivery={item.item} onItemPress={() => openDeliveryScreen(item.item)} />}
          ItemSeparatorComponent={renderFlatlistSeparator}
          ListFooterComponent={<ActivityIndicator animating={isLoadingMore} />}
          onEndReached={() => {}}
          ListEmptyComponent={
            <View style={[StylesConstants.COMMON_STYLES.flexCenter, { height: 250 }]}>
              <Text style={{ color: StylesConstants.MEDIUM_GREY }}>None for now</Text>
            </View>
          }
        />
      </View> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  map: {
    flexGrow: 1,
    width: Dimensions.get('window').width,
    // height: Dimensions.get('window').height,
  },

  userIcon: {
    width: 150, 
    height: 150,
    marginBottom: 24,
  },

  headerText: {
    fontSize: 36,
    // marginBottom: 4,
  },
  usernameText: {
    fontSize: 24,
    marginBottom: 12,
    color: StylesConstants.APP_SECONDARY_COLOR
  },

  item: {
    backgroundColor: StylesConstants.LIGHT_GREY,
    padding: 10,
    marginVertical: 4,
    // marginHorizontal: 16,
  },
  itemTitle: {
    fontSize: 12,
  },
});
