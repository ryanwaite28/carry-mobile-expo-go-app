import { Modal, StyleSheet, Alert, View, TouchableOpacity, Image, FlatList, SafeAreaView, Dimensions, RefreshControl, ActivityIndicator, Text } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { getBoundByRegion, getUserFullName } from '../../../utils/common.utils';
import { StylesConstants } from '../../../services/styles.constants';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PageHeader } from '../../../components/page-headers/page-header.component';
import { PageHeaderBack } from '../../../components/page-headers/page-header-back.component';
import { Ionicons } from '@expo/vector-icons';
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




export function SearchMainScreen() {
  const navigation = useNavigation<any>();

  const mapRef = useRef<MapView>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [location, set_location] = useState<Location.LocationObject | null>(null);
  const [coordinates, set_coordinates] = useState<any>(null);
  const [deliveries, set_deliveries] = useState<IDelivery[]>([]);
  const [list_view_modal_visible, set_list_view_modal_visible] = useState<boolean>(false);
  const [delivery_view_modal_visible, set_delivery_view_modal_visible] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [is_refreshing, set_is_refreshing] = useState<boolean>(false);
  const [lastRendered, setLastRendered] = useState<number>(Date.now());

  const ask_for_location = async () => {
    Alert.alert(
      "Get current location",
      "This will switch the map view to your current location",
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

  const refreshAvailableView = () => {
    if (!mapRef) {

    }
    set_deliveries([]);

    const useCoordinates = {
      northEast: coordinates?.northEast || {},
      southWest: coordinates?.southWest || {},
    };
    
    DeliveryService.browseMap(useCoordinates)
    .pipe(finalize(() => { setIsLoading(false); }))
    .subscribe({
      next: (response: ServiceMethodResultsInfo<IDelivery[]>) => {
        if (!response.data!.length) {
          Alert.alert(`No results...`);
          return;
        }
        
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


  if (isLoading) {
    return (
      <LoadingScreenComponent />
    );
  }

  const mapInitialRegion: any = !location ? null : {
    latitude: location?.coords.latitude,
    longitude: location?.coords.longitude,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const onClaim = (delivery: IDelivery) => {
    set_deliveries(deliveries.filter(d => d.id !== delivery.id));
    navigation.navigate(`Delivering`, {});
  }

  const openDeliveryScreen = (delivery: IDelivery) => {
    console.log(`navigating to open delivery`,  delivery);
    navigation.navigate(`DeliveryPreviewScreen`, { delivery });
  };

  const getMarkers = () => {
    return deliveries.map(delivery => (
      <Marker
        key={delivery.id.toString()}
        onPress={() => { openDeliveryScreen(delivery); }}
        coordinate={{
          latitude: delivery.from_lat,
          longitude: delivery.from_lng 
        }}
      />
    ));
  };

  const useGoToListView = () => {
    console.log(`===== Navigating to SearchListView =====`);
    navigation.navigate(`SearchListView`, {});
  };

  return (
    <SafeAreaView style={[StylesConstants.COMMON_STYLES.safeAreaViewContainer]}>
      <PageHeader header="Search for Deliveries">
        <TouchableOpacity style={{ marginLeft: 25 }} onPress={useGoToListView}>
          <MaterialIcons name="view-list" size={24} color="black" />
        </TouchableOpacity>

        <TouchableOpacity style={{ marginLeft: 25 }} onPress={ask_for_location}>
          <FontAwesome name="location-arrow" size={24} color="black" />
        </TouchableOpacity>

        <TouchableOpacity style={{ marginLeft: 25 }} onPress={refreshAvailableView}>
          <Ionicons name="ios-refresh" size={24} color="black" />
        </TouchableOpacity>
      </PageHeader>


        {
          !!mapInitialRegion ?
            <MapView ref={mapRef} style={styles.map} initialRegion={mapInitialRegion} onMapReady={handleMapReady} onRegionChange={handleRegionChange}>
              {getMarkers()}
            </MapView> :
            <MapView ref={mapRef} style={styles.map} onRegionChange={handleRegionChange} onMapReady={handleMapReady}>
              {getMarkers()}
            </MapView>
        }
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    flexGrow: 1,
    backgroundColor: 'red',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: `stretch`
  },

  map: {
    flexGrow: 1,
    // alignItems: 'center',
    // justifyContent: 'center',
    // alignSelf: `stretch`,
    width: `100%`,
    height: Dimensions.get('window').height,
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
