import { StyleSheet, Text, View, Modal, Alert, StatusBar, SafeAreaView, TouchableOpacity, Button, Image, Switch, ScrollView, Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import React, { useEffect, useState, useMemo } from 'react';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { Ionicons } from "@expo/vector-icons";
import { UsersService } from '../../services/users.service';
import { UserStoreService } from '../../services/user-store.service';
import { StylesConstants } from '../../services/styles.constants';
import { CommonTextInput } from '../inputs/textinput.component';
import { TextAreaInput } from '../inputs/textarea.component';
import { SelectInput } from '../inputs/select.component';
import { AppGlobalState } from '../../services/app.state';
import { PlainObject } from '../../interfaces/json-object.interface';
import { add_on_stripe_processing_fee, formatStripeAmount, get_distance_haversine_distance } from '../../utils/common.utils';
import { ImageUploadModal } from "../image-upload-modal.component";
import { IDelivery } from '../../interfaces/deliverme.interface';
import { IFormSubmitEvent } from '../../interfaces/_common.interface';
import { LoadingScreenComponent } from '../loading-screen.component';
import { CommonModal } from "../modal.component";
import { TermsAgreementComponent } from "../terms-agreement.component";
import RadioGroup, {RadioButtonProps} from 'react-native-radio-buttons-group';
import RadioButtonContainer from '../inputs/RadioButtonContainer.component';



export const sizes = [
  'X-SMALL',
  'SMALL',
  'MEDIUM',
  'LARGE',
  'X-LARGE',
].map((size: string, id: number) => ({ id: id.toString(), label: size, value: size, key: size }));

const payout_min = 5;

const componentForm: PlainObject = {
  street_number: 'short_name',
  route: 'long_name',
  locality: 'long_name',
  administrative_area_level_1: 'short_name',
  administrative_area_level_2: 'short_name',
  country: 'long_name',
  postal_code: 'short_name'
};

const switchName = (name: string) => {
  switch(name) {
    case 'locality':
      return 'city';
    case 'administrative_area_level_1':
      return 'state';
    case 'administrative_area_level_2':
        return 'county';
    case 'country':
      return 'country';
    case 'postal_code':
      return 'zipcode';

    default:
      return name;
  }
}


export function DeliveryForm(props) {
  const you = UserStoreService.getLatestState()!;

  const delivery: IDelivery | undefined = props.delivery;

  !!delivery && console.log(`Delivery editing:`, { payout: delivery?.payout });
  
  // state
  const [title, set_title] = useState(delivery?.title || "");
  const [description, set_description] = useState(delivery?.description || "");
  const [image, set_image] = useState("");
  const [payment_methods, set_payment_methods] = useState([]);
  const [payment_method_id, set_payment_method_id] = useState(delivery?.payment_method_id || "");
  const [payment_method_id_index, set_payment_method_id_index] = useState(-1);
  const [size, set_size] = useState(delivery?.size || "");
  const [size_index, set_size_index] = useState(-1);
  const [weight, set_weight] = useState(delivery?.weight || 0);
  const [payout, set_payout] = useState(delivery?.payout || 0);
  const [penalty, set_penalty] = useState(delivery?.penalty || 0);
  
  const [from_person, set_from_person] = useState(delivery?.from_person || "");
  const [from_person_phone, set_from_person_phone] = useState(delivery?.from_person_phone || "");
  const [from_person_email, set_from_person_email] = useState(delivery?.from_person_email || "");
  const [from_person_id_required, set_from_person_id_required] = useState(delivery?.from_person_id_required || false);
  const [from_person_sig_required, set_from_person_sig_required] = useState(delivery?.from_person_sig_required || false);
  
  const [to_person, set_to_person] = useState(delivery?.to_person || "");
  const [to_person_phone, set_to_person_phone] = useState(delivery?.to_person_phone || "");
  const [to_person_email, set_to_person_email] = useState(delivery?.to_person_email || "");
  const [to_person_id_required, set_to_person_id_required] = useState(delivery?.to_person_id_required || false);
  const [to_person_sig_required, set_to_person_sig_required] = useState(delivery?.to_person_sig_required || false);
  
  const [from_place, set_from_place] = useState({} as any);
  const [to_place, set_to_place] = useState({} as any);

  const [acknowledged, set_acknowledged] = useState(false);
  const [terms_modal_visible, set_terms_modal_visible] = useState(false);
  
  const [from_address_modal, set_from_address_modal] = useState(false);
  const [to_address_modal, set_to_address_modal] = useState(false);

  const [add_image_modal_visible, set_add_image_modal_visible] = useState(false);

  // effects
  const chargeFeeData = payout > 0 ? add_on_stripe_processing_fee(payout, UserStoreService.is_subscription_active) : null;

  useEffect(() => {
    UsersService.get_user_customer_cards_payment_methods(you.id).subscribe({
      next: (response) => {
        console.log(`\n\n`, response);
        const newPaymentMethods = response.data.map(
          pm => ({
            key: pm.id,
            value: pm.id,
            label: `${pm.card.brand.toUpperCase()} ${pm.card.last4} ${pm.card.exp_month}/${pm.card.exp_year}` 
          })
        );
        response.data && set_payment_methods(newPaymentMethods);
      },
      error: (error) => {
        error.response?.data?.message && Alert.alert(error.response?.data?.message);
      }
    });
  }, []);

  const radioButtons: RadioButtonProps[] = useMemo(() => sizes, []);


  const preparePayload = () => {
    const distance_miles = get_distance_haversine_distance({
      from_lat: from_place.lat || (delivery?.from_lat),
      from_lng: from_place.lng || (delivery?.from_lng),
      to_lat: to_place.lat || (delivery?.to_lat),
      to_lng: to_place.lng || (delivery?.to_lng),
    });

    const payload = {
      title,
      description,
      image,
      payment_method_id: payment_method_id_index === -1 ? null : payment_methods[payment_method_id_index]['value'],
      size: size_index === -1 ? null : sizes[size_index]['value'],
      weight,
      payout,
      penalty,

      from_person,
      from_person_email,
      from_person_phone,
      from_person_id_required,
      from_person_sig_required,

      to_person,
      to_person_email,
      to_person_phone,
      to_person_id_required,
      to_person_sig_required,

      from_location: from_place.location || (props.delivery?.from_location),
      from_address: from_place.address || (props.delivery?.from_address),
      from_street: from_place.street_number || (props.delivery?.from_street),
      from_city: from_place.city || (props.delivery?.from_city),
      from_state: from_place.state || (props.delivery?.from_state),
      from_zipcode: from_place.zipcode || (props.delivery?.from_zipcode),
      from_country: from_place.country || (props.delivery?.from_country),
      from_place_id: from_place.place_id || (props.delivery?.from_place_id),
      from_lat: from_place.lat || (props.delivery?.from_lat),
      from_lng: from_place.lng || (props.delivery?.from_lng),

      to_location: to_place.location || (props.delivery?.to_location),
      to_address: to_place.address || (props.delivery?.to_address),
      to_street: to_place.street_number || (props.delivery?.to_street),
      to_city: to_place.city || (props.delivery?.to_city),
      to_state: to_place.state || (props.delivery?.to_state),
      to_zipcode: to_place.zipcode || (props.delivery?.to_zipcode),
      to_country: to_place.country || (props.delivery?.to_country),
      to_place_id: to_place.place_id || (props.delivery?.to_place_id),
      to_lat: to_place.lat || (props.delivery?.to_lat),
      to_lng: to_place.lng || (props.delivery?.to_lng),

      distance_miles,

      auto_accept_anyone: false,
      urgent: false,
    };

    const formData = new FormData();
    formData.append(`payload`, JSON.stringify({...payload}));
    if (image) {
      // https://stackoverflow.com/questions/42521679/how-can-i-upload-a-photo-with-expo
      let localUri = image;
      let filename = localUri.split('/').pop()!;

      // Infer the type of the image
      let match = /\.(\w+)$/.exec(filename);
      let filetype = match ? `image/${match[1]}` : `image`;
      formData.append(`delivery_image`, {
        name: filename,
        type: filetype,
        uri: Platform.OS === "android" ? image : image.replace("file://", "")
      } as any);
    }
    
    const params: IFormSubmitEvent = {
      formData,
      payload
    };

    console.log({ payload });
    
    return params;
  };

  preparePayload();
  
  const handleSubmit = async () => {
    if (!acknowledged) {
      Alert.alert(`Please acknowledge and accept terms and agreements.`);
      return;
    }
    const params = await preparePayload();
    console.log(`submit clicked:`, params.payload);
    props.onSubmit(params);
  };

  const handlePlaceChange = (place) => {
    const formatted_address = place.formatted_address;
    const latitude = place.geometry.location.lat;
    const longitude = place.geometry.location.lng;
    const placeData: any = {};
    
    // Get each component of the address from the place details
    // and fill the corresponding field on the form.
    for (var i = 0; i < place.address_components.length; i++) {
      // var addressType = place.address_components[i].types[0];
      for (const t of place.address_components[i].types) {
        if (componentForm[t]) {
          var val = place.address_components[i][componentForm[t]];
          placeData[switchName(t)] = val;
        }
      }
    }
    if (!placeData['city']) {
      placeData['city'] = '';
    }
    if (!placeData['state']) {
      placeData['state'] = '';
    }

    const { city, country, zipcode, route, state, street_number } = placeData;
    const location = `${street_number} ${route}, ${city}, ${state} ${zipcode}, ${country}`.trim();
    const location2 = `${place.name ? (place.name + ' - ') : ''}${street_number ? (street_number + ' ') : ''}${route ? (route + ', ') : ''}${city ? (city + ', ') : ''}${state || ''}${zipcode ? (' ' + zipcode + ', ') : ', '}${country ? (country + ' ') : ''}`.trim().replace(/[\s]{2,}/, ' ');
    placeData.location = location2;
    placeData.address = formatted_address;
    placeData.lat = latitude;
    placeData.lng = longitude;

    return placeData;
  };

  const loadPlaceDetails = (place_id, use_state_fn) => {
    UsersService.loadGooglePlaceDetails(place_id).subscribe({
      next: (place) => {
        console.log({ place });
        const placeData = handlePlaceChange(place);
        console.log({ placeData });
        placeData.place_id = place_id;
        use_state_fn(placeData);
      },
      error: (error) => {
        error.response?.data?.message && Alert.alert(error.response?.data?.message);
      }
    });
  };

  if (props.isLoading) {
    return (
      <LoadingScreenComponent />
    );
  }

  return (
    <SafeAreaView style={StylesConstants.COMMON_STYLES.safeAreaViewContainer}>
      <ScrollView style={[styles.scrollView, StylesConstants.COMMON_STYLES.bgGrey]} keyboardShouldPersistTaps={'handled'}>
        
        <View style={{ marginBottom: 20 }}>
          <Text style={{ paddingVertical: 15, fontSize: 36 }}>Info</Text>

          <CommonTextInput placeholder="Enter Delivery Title" required={true} label="Title" value={title} onChange={(value) => set_title(value)} />
          <TextAreaInput placeholder="Enter Delivery Description" required={true} label="Description" value={description} onChange={(value) => set_description(value)} />

          {
            !!delivery && !!delivery.item_image_link && (
              <View>
                <Text>Current image</Text>
                <Image style={{ width: 200, height: 200, marginVertical: 15 }} source={{ uri: delivery.item_image_link }} />
              </View>
            )
          }
          {
            !image && (
              <>
                <TouchableOpacity style={StylesConstants.COMMON_STYLES.btnSecondaryFullWidth} onPress={() => set_add_image_modal_visible(true)}>
                  <Text style={StylesConstants.COMMON_STYLES.btnTextWhite}>Add Picture</Text>
                </TouchableOpacity>

                <ImageUploadModal
                  header="Upload Delivery Picture"
                  visible={add_image_modal_visible}
                  set_visible={set_add_image_modal_visible}
                  onSubmit={(imageInfo) => { set_image(imageInfo.uri); }}
                />
              </>
            )
          }
          {
            !!image && (
              <TouchableOpacity style={StylesConstants.COMMON_STYLES.btnSecondaryFullWidth} onPress={() => set_image("")}>
                <Text style={StylesConstants.COMMON_STYLES.btnTextWhite}>Clear Image</Text>
              </TouchableOpacity>
            )
          }
          {image && <Image style={{ width: 200, height: 200, marginTop: 15 }} source={{ uri: image }} />}

          {/* <SelectInput placeholder="Select Size" required={true} label="Size" items={sizes} value={size} onChange={(value) => set_size(value)} /> */}
          <View style={{ marginTop: 15 }}>
            <Text>* Select Size</Text>
            <RadioButtonContainer values={sizes} onPress={(index) => set_size_index(index)} />
          </View>
          <CommonTextInput placeholder="Enter Weight" required={true} label={"Weight (in lbs)" + (delivery ? ` - Current: ${weight}`: '')} keyboardType="number-pad" value={weight} onChange={(value) => set_weight(parseInt(value))} />
          <CommonTextInput placeholder="Enter Payout" required={true} label={"Payout" + (delivery ? ` - Current: ${payout}`: '')} keyboardType="number-pad" value={payout} onChange={(value) => set_payout(parseInt(value))} />
          <CommonTextInput placeholder="Enter Penalty Reimbursment" required={true} label={"Reimbursement" + (delivery ? ` - Current: ${penalty}`: '')} keyboardType="number-pad" value={penalty} onChange={(value) => set_penalty(parseInt(value))} />

          <View style={{ marginVertical: 30 }}></View>
          
          <View>
            <Text style={{ paddingVertical: 15, fontSize: 36 }}>Pickup</Text>

            <CommonTextInput placeholder="Person to pick up from" required={true} label="From Name" value={from_person} onChange={(value) => set_from_person(value)} />
            <CommonTextInput placeholder="Pickup person email" label="From Email" keyboardType="email-address" value={from_person_email} onChange={(value) => set_from_person_email(value)} />
            <CommonTextInput placeholder="Person person phone" label="From Phone" keyboardType="phone-pad" value={from_person_phone} onChange={(value) => set_from_person_phone(value)} />
            <View style={{ display: 'flex', flexDirection: 'row', marginTop: 15, marginBottom: 15, alignItems: 'center' }}>
              <View style={{ display: 'flex', flexDirection: 'row', marginTop: 15, marginBottom: 15, alignItems: 'center' }}>
                <Switch onValueChange={(value) => set_from_person_id_required(value)} value={from_person_id_required} /> 
                <Text style={{ marginLeft: 10 }}>ID Required</Text>
              </View>
              <View style={{ display: 'flex', flexDirection: 'row', marginLeft: 15, alignItems: 'center' }}>
                <Switch onValueChange={(value) => set_from_person_sig_required(value)} value={from_person_sig_required} /> 
                <Text style={{ marginLeft: 10 }}>Signature Required</Text>
              </View>
            </View>
            <Text style={{ marginBottom: 15 }}>From Address *</Text>
            {
              !!delivery && (
                <View>
                  <Text>Current From Address:</Text>
                  <Text style={{ marginBottom: 10, flexShrink: 1, flexWrap: 'wrap' }}>{delivery.from_location}</Text>
                </View>
              )
            }
            {/* <GooglePlacesAutocomplete
              placeholder="From Address"
              currentLocation={false}
              disableScroll={true}
              listViewDisplayed={false}
              keyboardShouldPersistTaps={'handled'}
              onPress={(data, details = null) => {
                // 'details' is provided when fetchDetails = true
                console.log(JSON.stringify({ data, details }));
                loadPlaceDetails(data.place_id, set_from_place);
              }}
              query={{
                key: AppGlobalState.GOOGLE_API_KEY,
                language: 'en',
              }}
              styles={{
                container: {backgroundColor: 'transparent'},
                textInputContainer: googleAutocompleteStyles.textInputContainer,
                textInput: googleAutocompleteStyles.textInput,
                placeholderTextColor: StylesConstants.MEDIUM_GREY,
              }}
            /> */}

            <TouchableOpacity style={StylesConstants.COMMON_STYLES.btnPrimaryFullWidth} onPress={() => set_from_address_modal(true)}>
              <Text style={StylesConstants.COMMON_STYLES.btnTextWhite}>Set From Address</Text>
            </TouchableOpacity>
            <CommonModal
              header="From Address"
              handleMainSection={true}
              modal_visible={from_address_modal}
              set_modal_visible={set_from_address_modal}
            >
              <View style={{ padding: 20 }}>
                <Text style={{ marginBottom: 10 }}>Search Address</Text>
                <TouchableOpacity style={[StylesConstants.COMMON_STYLES.btnPrimaryFullWidth, { marginVertical: 10, position: 'relative', zIndex: 10 }]} onPress={() => set_from_address_modal(false)}>
                  <Text style={StylesConstants.COMMON_STYLES.btnTextWhite}>Save</Text>
                </TouchableOpacity>
                <GooglePlacesAutocomplete
                  placeholder="From Address"
                  currentLocation={false}
                  disableScroll={false}
                  listViewDisplayed={true}
                  fetchDetails={true}
                  keyboardShouldPersistTaps={'handled'}
                  onPress={(data, details = null) => {
                    // 'details' is provided when fetchDetails = true
                    console.info(`===== place selected`, JSON.stringify({ data, details }));
                    loadPlaceDetails(data.place_id, set_from_place);
                  }}
                  query={{
                    key: AppGlobalState.GOOGLE_API_KEY,
                    language: 'en',
                  }}
                  // https://stackoverflow.com/questions/70430848/how-do-i-change-placeholder-text-on-google-places-autocomplete-component-in-reac
                  textInputProps={{
                    placeholderTextColor: 'grey',
                    returnKeyType: "search"
                  }}
                  styles={{
                    container: {backgroundColor: 'transparent'},
                    textInputContainer: googleAutocompleteStyles.textInputContainer,
                    textInput: googleAutocompleteStyles.textInput,
                    marginVertical: 10,
                    listView: {
                      color: 'black', //To see where exactly the list is
                      zIndex: 1000, //To popover the component outwards
                      position: 'absolute',
                      top: 45
                    },
                  }}
                />
              </View>
            </CommonModal>
            {
              !!from_place && <Text style={{ marginTop: 10 }}>{from_place.address}</Text>
            }
          </View>

          <View style={{ marginVertical: 30 }}></View>

          <View>
            <Text style={{ paddingVertical: 15, fontSize: 36 }}>Dropoff</Text>

            <CommonTextInput placeholder="Person to pick up to" required={true} label="To Name" value={to_person} onChange={(value) => set_to_person(value)} />
            <CommonTextInput placeholder="Pickup person email" label="To Email" keyboardType="email-address" value={to_person_email} onChange={(value) => set_to_person_email(value)} />
            <CommonTextInput placeholder="Person person phone" label="To Phone" keyboardType="phone-pad" value={to_person_phone} onChange={(value) => set_to_person_phone(value)} />
            <View style={{ display: 'flex', flexDirection: 'row', marginTop: 15, marginBottom: 15, alignItems: 'center' }}>
              <View style={{ display: 'flex', flexDirection: 'row', marginTop: 15, marginBottom: 15, alignItems: 'center' }}>
                <Switch onValueChange={(value) => set_to_person_id_required(value)} value={to_person_id_required} /> 
                <Text style={{ marginLeft: 10 }}>ID Required</Text>
              </View>
              <View style={{ display: 'flex', flexDirection: 'row', marginLeft: 15, alignItems: 'center' }}>
                <Switch onValueChange={(value) => set_to_person_sig_required(value)} value={to_person_sig_required} /> 
                <Text style={{ marginLeft: 10 }}>Signature Required</Text>
              </View>
            </View>
            <Text style={{ marginBottom: 15 }}>To Address *</Text>
            {
              !!delivery && (
                <View>
                  <Text>Current To Address:</Text>
                  <Text style={{ marginBottom: 10, flexShrink: 1, flexWrap: 'wrap' }}>{delivery.to_location}</Text>
                </View>
              )
            }
            {/* <GooglePlacesAutocomplete
              placeholder="To Address"
              currentLocation={false}
              disableScroll={true}
              onPress={(data, details = null) => {
                // 'details' is provided when fetchDetails = true
                console.log(JSON.stringify({ data, details }));
                loadPlaceDetails(data.place_id, set_to_place);
              }}
              query={{
                key: AppGlobalState.GOOGLE_API_KEY,
                language: 'en',
              }}
              styles={{
                container: {backgroundColor: 'transparent'},
                textInputContainer: googleAutocompleteStyles.textInputContainer,
                textInput: googleAutocompleteStyles.textInput,
                placeholderTextColor: StylesConstants.MEDIUM_GREY,
              }}
            /> */}

            <TouchableOpacity style={StylesConstants.COMMON_STYLES.btnPrimaryFullWidth} onPress={() => set_to_address_modal(true)}>
              <Text style={StylesConstants.COMMON_STYLES.btnTextWhite}>Set To Address</Text>
            </TouchableOpacity>
            <CommonModal
              header="To Address"
              handleMainSection={true}
              modal_visible={to_address_modal}
              set_modal_visible={set_to_address_modal}
            >
              <View style={{ padding: 20 }}>
                <Text style={{ marginBottom: 10 }}>Search Address</Text>
                <TouchableOpacity style={[StylesConstants.COMMON_STYLES.btnPrimaryFullWidth, { marginVertical: 10, position: 'relative', zIndex: 10 }]} onPress={() => set_to_address_modal(false)}>
                  <Text style={StylesConstants.COMMON_STYLES.btnTextWhite}>Save</Text>
                </TouchableOpacity>
                <GooglePlacesAutocomplete
                  placeholder="To Address"
                  currentLocation={false}
                  disableScroll={false}
                  listViewDisplayed={true}
                  fetchDetails={true}
                  keyboardShouldPersistTaps={'handled'}
                  onPress={(data, details = null) => {
                    // 'details' is provided when fetchDetails = true
                    console.info(`===== place selected`, JSON.stringify({ data, details }));
                    loadPlaceDetails(data.place_id, set_to_place);
                  }}
                  query={{
                    key: AppGlobalState.GOOGLE_API_KEY,
                    language: 'en',
                  }}
                  // https://stackoverflow.com/questions/70430848/how-do-i-change-placeholder-text-on-google-places-autocomplete-component-in-reac
                  textInputProps={{
                    placeholderTextColor: 'grey',
                    returnKeyType: "search"
                  }}
                  styles={{
                    container: {backgroundColor: 'transparent'},
                    textInputContainer: googleAutocompleteStyles.textInputContainer,
                    textInput: googleAutocompleteStyles.textInput,
                    marginVertical: 10,
                    listView: {
                      color: 'black', //To see where exactly the list is
                      zIndex: 1000, //To popover the component outwards
                      position: 'absolute',
                      top: 45
                    },
                  }}
                />
              </View>
            </CommonModal>
            {
              !!to_place && <Text style={{ marginTop: 10 }}>{to_place.address}</Text>
            }
          </View>

          <View style={{ marginVertical: 30 }}></View>

          <View>
            <Text style={{ paddingVertical: 15, fontSize: 36 }}>Review</Text>

            {
              !!chargeFeeData && (
                <View style={{ marginTop: 25, marginBottom: 35 }}>
                  <Text>Delivery payout: ${formatStripeAmount(chargeFeeData.total)} (Goes to carrier)</Text>
                  <Text>Application fee: ${formatStripeAmount(chargeFeeData.app_fee)}</Text>
                  <Text>Processing fee: ${formatStripeAmount(chargeFeeData.stripe_final_processing_fee)} (Non refundable)</Text>
                  <Text>Refund/Cancelation: ${formatStripeAmount(chargeFeeData.refund_amount)} (Amount if you cancel/delete listing)</Text>
                  <Text>Final total: ${formatStripeAmount(chargeFeeData.final_total)}</Text>
                </View>
              )
            }

            {/* <SelectInput placeholder="Select Payment Method" required={true} label="Payment Method" items={payment_methods} value={payment_method_id} onChange={(value) => set_payment_method_id(value)} /> */}
            <View style={{ marginTop: 15 }}>
              <Text>* Select Payment Method</Text>
              <RadioButtonContainer values={payment_methods} onPress={(index) => set_payment_method_id_index(index)} />
            </View>

            <View style={{ display: 'flex', flexDirection: 'row', marginTop: 50, marginBottom: 25, alignItems: 'center' }}>
              <Switch onValueChange={(value) => set_acknowledged(value)} value={acknowledged} /> 
              
              <View style={{ marginLeft: 20, marginRight: 10, padding: 20  }}>
                <View style={{}}> 
                  <Text style={StylesConstants.COMMON_STYLES.textWrap}>
                    I have read and accepted the terms and agreements.
                  </Text>
                </View>
                <TouchableOpacity onPress={() => set_terms_modal_visible(true)}>
                  <Ionicons name="md-information-circle" size={24} color={StylesConstants.APP_PRIMARY_COLOR} />
                </TouchableOpacity>
              </View>
            </View>

            <CommonModal
              header="Terms & Agreement"
              modal_visible={terms_modal_visible}
              set_modal_visible={set_terms_modal_visible}
            >
              <TermsAgreementComponent />
            </CommonModal>
          </View>



          <TouchableOpacity style={StylesConstants.COMMON_STYLES.btnPrimaryFullWidth} onPress={handleSubmit}>
            <Text style={StylesConstants.COMMON_STYLES.btnTextWhite}>Submit</Text>
          </TouchableOpacity>
        </View>
  
      </ScrollView>
    </SafeAreaView>
  );
}




const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    paddingTop: (StatusBar.currentHeight || 0) + 50,
    paddingBotom: (StatusBar.currentHeight || 0) + 200,
    paddingLeft: 20,
    paddingRight: 20,
    backgroundColor: 'white',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  scrollView: {
    paddingHorizontal: 20,
  },

  infoBox: {
    elevation: 5,
    borderRadius: 2,
    borderColor: StylesConstants.MEDIUM_LIGHT_GREY,
    borderWidth: 1,
    padding: 25,
    marginBottom: 25,

    backgroundColor: 'white',
    shadowColor: 'black',
    shadowOpacity: 0.10,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 1 },
  },
  infoBoxZeroPadding: {
    elevation: 5,
    borderRadius: 2,
    borderColor: StylesConstants.MEDIUM_LIGHT_GREY,
    borderWidth: 1,
    marginBottom: 25,

    backgroundColor: 'white',
    shadowColor: 'black',
    shadowOpacity: 0.10,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 1 },
  },

  addressModalContainer: {
    // flex: 1,
    paddingTop: (StatusBar.currentHeight || 0) + 50,
    paddingBotom: (StatusBar.currentHeight || 0) + 200,
    paddingLeft: 20,
    paddingRight: 20,
    backgroundColor: 'white',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },

  userIcon: {
    flex: 1,
    height: 350,
    width: undefined,
    // resizeMode: `contain`,
    // aspectRatio: 1,
    // width: `100%`, 
    marginBottom: 24,
  },

  headerText: {
    fontSize: 24,
    // marginBottom: 4,
  },
  usernameText: {
    fontSize: 16,
    marginBottom: 12,
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
    padding: 10,
  },
  statusText: {
    padding: 10,
  },
  membershipTextStyleActive: {
    padding: 4,
    color: `white`,
    backgroundColor: `green`,
    borderRadius: 4,
  },
  membershipTextStyleNotActive: {
    padding: 4,
    color: `white`,
    backgroundColor: `red`,
    borderRadius: 4,
  },
  input: {
    height: 40,
    // margin: 12,
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    width: `100%`,
    elevation: 3,
  },
  label: {
    marginBottom: 10,
  },
});

const googleAutocompleteStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  textInputContainer: {
    flexDirection: 'row',
  },
  textInput: {
    borderColor: StylesConstants.MEDIUM_GREY,
    borderWidth: 1,
    borderRadius: 4,
    backgroundColor: 'white',
    height: 45,
    width: `90%`,
    paddingVertical: 5,
    paddingHorizontal: 10,
    fontSize: 15,
    flex: 1,
    color: 'black'
  },
  poweredContainer: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderBottomRightRadius: 5,
    borderBottomLeftRadius: 5,
    borderColor: '#c8c7cc',
    borderTopWidth: 0.5,
  },
  powered: {},
  listView: {},
  row: {
    backgroundColor: '#FFFFFF',
    padding: 13,
    height: 44,
    flexDirection: 'row',
  },
  separator: {
    height: 0.5,
    backgroundColor: '#c8c7cc',
  },
  description: {},
  loader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    height: 20,
  },
});