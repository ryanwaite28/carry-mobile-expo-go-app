import React, { useEffect, useRef, useState } from "react";

import { SafeAreaView, StyleSheet, Image, Text, View, TouchableOpacity, Alert, RefreshControl } from "react-native";
import { StylesConstants } from "../../../services/styles.constants";
import { PageHeader } from '../../../components/page-headers/page-header.component';
import { dateTimeTransform, getLinkingListener, getUserFullName, getUserIcon } from "../../../utils/common.utils";
import { filter, finalize } from "rxjs";
import { LoadingScreenComponent } from '../../../components/loading-screen.component';
import { UserStoreService } from "../../../services/user-store.service";
import { CommonTextInput } from '../../../components/inputs/textinput.component';
import { ImageUploadModal } from "../../../components/image-upload-modal.component";
import { UsersService } from "../../../services/users.service";
import { SelectInput } from '../../../components/inputs/select.component';
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { CardField, CardForm, useStripe } from '@stripe/stripe-react-native';
import * as Linking from 'expo-linking';
import { CreateParams } from "@stripe/stripe-react-native/lib/typescript/src/types/PaymentMethod";
import * as WebBrowser from 'expo-web-browser';
import { SocketEventsService } from "../../../services/socket-events.service";
import { MODERN_APPS } from "../../../enums/all.enums";
import { DELIVERME_EVENT_TYPES, COMMON_EVENT_TYPES } from "../../../enums/modern.enums";




const settings_link = Linking.createURL('/settings');



export function SettingsMainScreen() {
  const stripe = useStripe();
  const [you, set_you] = useState(UserStoreService.getLatestState()!);
  const [is_refreshing, set_is_refreshing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [username, set_username] = useState<string>(you.username);
  const [email, set_email] = useState<string>(you.email);
  const [phone, set_phone] = useState<string>(you.phone);
  const [sms_verification_code_sent, set_sms_verification_code_sent] = useState<boolean>(false);
  const [sms_verification_code, set_sms_verification_code] = useState<string>('');
  const [sms_results, set_sms_results] = useState<any>(null);
  const [phone_updated_successfully, set_phone_updated_successfully] = useState<boolean>(false);
  const [old_password, set_old_password] = useState<string>('');
  const [password, set_password] = useState<string>('');
  const [confirm_password, set_confirm_password] = useState<string>('');
  const [platform_subscription, set_platform_subscription] = useState<any>(null);
  const [image_info, set_image_info] = useState<any>(null);
  const [add_image_modal_visible, set_add_image_modal_visible] = useState(false);
  const [payment_methods, set_payment_methods] = useState<any[]>([]);
  const [payment_method_id, set_payment_method_id] = useState("");
  const [card_details, set_card_details] = useState<any>(null);
  const [cardFormDetails, setCardFormDetails] = useState<any>(null);
  const cardRef = useRef<any>(null);
  const cardFormRef = useRef<any>(null);
  
  const userIcon = getUserIcon(you);
  
  console.log(`SettingsMainScreen rendered`, {
    you,
    is_refreshing,
    isLoading,
    username, 
    email,
    phone,
    sms_results,
    sms_verification_code,
    sms_verification_code_sent,
    phone_updated_successfully,
    old_password,
    password,
    confirm_password,
    platform_subscription,
    image_info,
    add_image_modal_visible,
    payment_methods,
    payment_method_id,
    card_details,
    userIcon,
    cardRef,
    cardFormRef,
    cardFormDetails,
    stripe
  });

  useEffect(() => {
    getLinkingListener()
      .pipe(filter((info: any) => {
        const match = info?.linkData?.path === `settings`;
        console.log({ match });
        return match;
      }))
      .subscribe({
        next: (info) => {
          console.log(`settings open requested`, { info });
        }
      });
  }, []);

  useEffect(() => {
    load_payment_methods();

    UsersService.get_platform_subscription(you.id).subscribe({
      next: (response: any) => {
        console.log(`platform status:`, { response });
        set_platform_subscription(response.data);
      }
    });
  }, []);

  useEffect(() => {
    SocketEventsService.listenToObservableEventStream(MODERN_APPS.COMMON, COMMON_EVENT_TYPES.STRIPE_ACCOUNT_VERIFIED).subscribe({
      next: (event) => {
        console.log("----- stripe verified", event);
        
        set_is_refreshing(true);
        UsersService.checkSession()
        .pipe(finalize(() => { set_is_refreshing(false); }))
        .subscribe({
          next: (response) => {
            console.log(`\n\n`, { response }, `\n\n`);
            if (response?.data?.you) {
              set_you(response.data.you);
            }
          }
        });
      }
    });
  }, []);
  


  const isSubscriptionExpired: boolean = (() => {
    if (!platform_subscription) {
      return false;
    }

    const now = Date.now();
    const end = platform_subscription.current_period_end * 1000;
    const isExpired = now > end;
    console.log({ now, end, isExpired });
    return isExpired; 
  })();



  

  // handlers

  const load_payment_methods = () => {
    UsersService.get_user_customer_cards_payment_methods(you.id)
    .subscribe({
      next: (response) => {
        console.log(`\n\n`, response);
        const newPaymentMethods = response.data.map(
          pm => ({
            id: pm.id,
            key: pm.id,
            value: pm.id,
            label: `${pm.card.brand.toUpperCase()} ${pm.card.last4} ${pm.card.exp_month}/${pm.card.exp_year}` 
          })
        );
        response.data && set_payment_methods(newPaymentMethods);
      },
      error: (error) => {
        console.error({ error });
      }
    });
  };

  const onRefreshYou = () => {
    set_is_refreshing(true);
    UsersService.checkSession()
    .pipe(finalize(() => { set_is_refreshing(false); }))
    .subscribe({
      next: (response) => {
        console.log(`\n\n`, { response }, `\n\n`);
        if (response?.data?.you) {
          set_you(response.data.you);
        }
      }
    });
  };



  const submitBasicInfo = () => {
    setIsLoading(true);
    UsersService.update_info(you.id, { email, username })
    .pipe(finalize(() => { setIsLoading(false); }))
    .subscribe({
      next: (response: any) => {
        response.message && Alert.alert(response.message);
        set_add_image_modal_visible(false);
      },
      error: (error) => {
        error.response?.data?.message && Alert.alert(error.response?.data?.message);
      }
    });
  };

  const sendSmsVerificationRequest = () => {
    if (phone.toLowerCase() === `x`) {
      Alert.alert(
        `The phone input was "x". Remove phone from your account?`,
        '',
        [
          {
            text: `Cancel`,
            style: `cancel`,
            onPress: () => {}
          },
          {
            text: `Submit`,
            onPress: confirmSendSmsClear
          }
        ]
      );

      return;
    }

    if (!(/[\d]{10}/).test(phone)) {
      Alert.alert(`Phone input must be numbers only and 10 digits`);
      return;
    }

    const usePhone = `1` + phone;

    setIsLoading(true);
    UsersService.send_sms_verification(usePhone)
    .pipe(finalize(() => { setIsLoading(false); }))
    .subscribe({
      next: (response: any) => {
        response.message && Alert.alert(response.message);
        set_sms_results(response.data.sms_results);
        set_sms_verification_code_sent(true);
        set_phone_updated_successfully(false);
        // console.log({ sms_results });
      },
      error: (error) => {
        error.response?.data?.message && Alert.alert(error.response?.data?.message);
      }
    });
  };

  const confirmSendSmsClear = () => {
    setIsLoading(true);
    UsersService.send_sms_verification(`x`)
    .pipe(finalize(() => { setIsLoading(false); }))
    .subscribe({
      next: (response: any) => {
        response.message && Alert.alert(response.message);
        set_phone('');
        set_sms_verification_code('');
        set_sms_verification_code_sent(false);
        set_phone_updated_successfully(false);
      },
      error: (error) => {
        error.response?.data?.message && Alert.alert(error.response?.data?.message);
      }
    });
  };
  
  const sendSmsVerificationCode = () => {
    const usePhone = `1` + phone;
    setIsLoading(true);
    UsersService.verify_sms_code({ request_id: sms_results.request_id, code: sms_verification_code, phone: usePhone })
    .pipe(finalize(() => { setIsLoading(false); }))
    .subscribe({
      next: (response: any) => {
        response.message && Alert.alert(response.message);
        set_sms_verification_code('');
        set_sms_verification_code_sent(false);
        set_phone_updated_successfully(false);
        onRefreshYou();
      },
      error: (error) => {
        error.response?.data?.message && Alert.alert(error.response?.data?.message);
      }
    });
  };

  const submitIcon = () => {
    const formData = new FormData();
    formData.append(`icon`, image_info);

    setIsLoading(true);
    UsersService.update_icon(you.id, formData)
    .pipe(finalize(() => { setIsLoading(false); }))
    .subscribe({
      next: (response: any) => {
        response.message && Alert.alert(response.message);
        set_image_info(null);
      },
      error: (error) => {
        error.response?.data?.message && Alert.alert(error.response?.data?.message);
      }
    });
  };

  const submitPasswordChange = () => {
    setIsLoading(true);
    UsersService.update_password(you.id, {
      oldPassword: old_password,
      password: password,
      confirmPassword: confirm_password,
    })
    .pipe(finalize(() => { setIsLoading(false); }))
    .subscribe({
      next: (response: any) => {
        response.message && Alert.alert(response.message);
        set_old_password('');
        set_password('');
        set_confirm_password('');
      },
      error: (error) => {
        error.response?.data?.message && Alert.alert(error.response?.data?.message);
      }
    });
  };

  const createStripeAccount = () => {
    // coming here with this action indicates that the action was successful
    // const redirectUrl = Linking.createURL('settings', {
    //   queryParams: { action: 'createStripeAccount' },
    // });


    const handleUrl = (ev) => {
      console.log(`ev:`, ev);
      
    };
    var listener = Linking.addEventListener(`url`, handleUrl);
    // listener.remove();

    setIsLoading(true);
    UsersService.create_stripe_account(you.id, '')
    .pipe(finalize(() => { setIsLoading(false); }))
    .subscribe({
      next: async (response) => {
        // set_onboarding_url(response.data.onboarding_url);
        const status = await Linking.canOpenURL(response.data.onboarding_url);
        if (!status) {
          Alert.alert(`Could not start stripe account creation session...`);
          return;
        }
        const results = await WebBrowser.openBrowserAsync(response.data.onboarding_url);
        console.log(`results:`, results);

        // WebBrowser.openBrowserAsync(response.data.onboarding_url);
      },
      error: (error) => {
        error?.message && Alert.alert(error?.message);
      }
    });
  }

  const onSubscribeToPlatform = () => {
    setIsLoading(true);
    UsersService.create_subscription(you.id, payment_method_id)
    .pipe(finalize(() => { setIsLoading(false); }))
    .subscribe({
      next: (response: any) => {
        Alert.alert(response.message || `Subscribed!`);
        set_platform_subscription(response.data!.subscription);
      },
      error: (error) => {
        error.response?.data?.message && Alert.alert(error.response?.data?.message);
      },
    });
  };

  const onUnsubscribeToPlatform = () => {
    setIsLoading(true);
    UsersService.cancel_subscription(you.id)
    .pipe(finalize(() => { setIsLoading(false); }))
    .subscribe({
      next: (response: any) => {
        Alert.alert(response.message || `Subscription Canceled.`);
        set_platform_subscription(response.data!.subscription);
      },
      error: (error) => {
        error.response?.data?.message && Alert.alert(error.response?.data?.message);
      },
    });
  };

  const removePaymentMethod = (pm, i: number) => {
    setIsLoading(true);
    UsersService.remove_card_payment_method_to_user_customer(you.id, pm.id)
    .pipe(finalize(() => { setIsLoading(false); }))
    .subscribe({
      next: (response: any) => {
        response.message && Alert.alert(response.message);
        const newList = payment_methods.filter(p => p.id !== pm.id);
        console.log({ o: payment_methods.length, l: newList.length });
        set_payment_methods([ ...newList ]);
      },
      error: (error) => {
        error.response?.data?.message && Alert.alert(error.response?.data?.message);
      },
    });
  };

  const addCardToStripeCustomerAccount = async () => {
    if (!cardFormDetails || !cardFormDetails?.complete) {
      return;
    }

    try {
      const createCardParams: CreateParams = {
        paymentMethodType: 'Card',
        paymentMethodData: {
          billingDetails: {
            name: getUserFullName(you),
            email: you.email,
            phone: you.phone || '',
          },
        }
      };

      console.log({ createCardParams });
      const pm = await stripe.createPaymentMethod(createCardParams);
      console.log(JSON.stringify({ pm }));
  
      if (!pm.paymentMethod || pm.error) {
        console.log({ pm });
        Alert.alert(`There was a problem with the payment menthod, check the inputs and try again.`);
        return;
      }
  
      setIsLoading(true);
      UsersService.add_card_payment_method_to_user_customer(you.id, pm.paymentMethod.id)
      .pipe(finalize(() => { setIsLoading(false); }))
      .subscribe({
        next: (response) => {
          response.message && Alert.alert(response.message);
          const pm = response.data;
          const pmObj = {
            id: pm.id,
            key: pm.id,
            value: pm.id,
            label: `${pm.card.brand.toUpperCase()} ${pm.card.last4} ${pm.card.exp_month}/${pm.card.exp_year}` 
          };
          set_payment_methods([ pmObj, ...payment_methods ]);
          // cardRef && cardRef.current.clear && cardRef.current.clear();
          // set_card_details(null);
        },
        error: (error) => {
          error.response?.data?.message && Alert.alert(error.response?.data?.message);
        },
      });
    }
    catch (error) {
      console.error(error);
      Alert.alert(`Could not add payment method; something went wrong...`);
    }
  };

  const logoutHandler = () => {
    console.log(`signing out...`);
    UsersService.sign_out().subscribe({
      next: () => {
        console.log(`signed out`);
      }
    });
  };

  const platform_subscription_end = dateTimeTransform(new Date(platform_subscription?.current_period_end * 1000));



  
  if (isLoading) {
    return (
      <LoadingScreenComponent />
    );
  }

  return (
    <SafeAreaView style={[StylesConstants.COMMON_STYLES.safeAreaViewContainer]}>
      <PageHeader header="Settings">
        {/* <TouchableOpacity style={{ marginLeft: 25 }} onPress={goBackHandler}>
          <Ionicons name="md-return-up-back-outline" size={24} color="black" />
        </TouchableOpacity> */}
      </PageHeader>

      <KeyboardAwareScrollView
        style={[StylesConstants.COMMON_STYLES.bgGrey, { paddingHorizontal: 10, paddingTop: 10 }]}
        refreshControl={<RefreshControl refreshing={is_refreshing} onRefresh={onRefreshYou} />}
      >
        <TouchableOpacity style={[StylesConstants.COMMON_STYLES.btnSecondaryFullWidth, { marginBottom: 50 }]} onPress={logoutHandler}>
          <Text style={StylesConstants.COMMON_STYLES.btnTextWhite}>Log Out</Text>
        </TouchableOpacity>

        {/* Basic Info */}
        <View style={[StylesConstants.COMMON_STYLES.infoBoxZeroPaddingMargin, { padding: 15, marginBottom: 15 }]}>
          <Text style={{ padding: 15, fontSize: 24 }}>Basic Info</Text>

          <CommonTextInput
            placeholder="Enter Username" 
            required={true}
            label="Username"
            value={username}
            onChange={(value) => set_username(value)} 
          />
          <CommonTextInput
            placeholder="Enter Email" 
            keyboardType="email-address"
            required={true}
            label="Email"
            value={email}
            onChange={(value) => set_email(value.toLowerCase())} 
          />
          
          <TouchableOpacity
            style={[StylesConstants.COMMON_STYLES.btnSecondaryFullWidth, { marginTop: 10 }]}
            onPress={submitBasicInfo}
          >
            <Text style={StylesConstants.COMMON_STYLES.btnTextWhite}>Update</Text>
          </TouchableOpacity>
        </View>

        {/* Phone */}
        <View style={[StylesConstants.COMMON_STYLES.infoBoxZeroPaddingMargin, { padding: 15, marginBottom: 15 }]}>
          <Text style={{padding: 15, fontSize: 24}}>
            Phone { you.phone && `(Current number: ${you.phone})` }
          </Text>
          <Text>Add your phone number to get real-time text/sms notifications and alerts. Input an "x" to remove your phone number.</Text>

          <CommonTextInput
            placeholder="Enter Phone" 
            required={true}
            label="phone"
            value={phone}
            onChange={(value) => set_phone(value)} 
          />

            <TouchableOpacity
              style={[StylesConstants.COMMON_STYLES.btnSecondaryFullWidth, { marginTop: 10 }]}
              onPress={sendSmsVerificationRequest}
            >
              <Text style={StylesConstants.COMMON_STYLES.btnTextWhite}>
                
                { !sms_verification_code_sent ? 'Send Verification Code' : 'Resend Verification Code' }
              </Text>
            </TouchableOpacity>

          { sms_verification_code_sent && !phone_updated_successfully &&
            <CommonTextInput
              placeholder="Enter Verification Code" 
              required={true}
              label="Verification Code"
              value={sms_verification_code}
              onChange={(value) => set_sms_verification_code(value)} 
            />
          }
          
          {/* { !sms_verification_code_sent && 
            <TouchableOpacity
              style={[StylesConstants.COMMON_STYLES.btnSecondaryFullWidth, { marginTop: 10 }]}
              onPress={sendSmsVerificationRequest}
            >
              <Text style={StylesConstants.COMMON_STYLES.btnTextWhite}>Send Verification Code</Text>
            </TouchableOpacity>
          } */}

          { sms_verification_code_sent && !phone_updated_successfully &&
            <TouchableOpacity
              style={[StylesConstants.COMMON_STYLES.btnSecondaryFullWidth, { marginTop: 10 }]}
              onPress={sendSmsVerificationCode}
            >
              <Text style={StylesConstants.COMMON_STYLES.btnTextWhite}>Verify Code</Text>
            </TouchableOpacity>
          }
        </View>

        {/* Icon */}
        <View style={[StylesConstants.COMMON_STYLES.infoBoxZeroPaddingMargin, { padding: 15, marginBottom: 15 }]}>
          <Text style={{padding: 15, fontSize: 24}}>
            Icon
          </Text>

          <Text>Your Current Icon</Text>
          <Image style={{ width: 200, height: 200, margin: 15 }} source={userIcon} />

          {
            !image_info && (
              <>
                <TouchableOpacity style={StylesConstants.COMMON_STYLES.btnSecondaryFullWidth} onPress={() => set_add_image_modal_visible(true)}>
                  <Text style={StylesConstants.COMMON_STYLES.btnTextWhite}>Change Picture</Text>
                </TouchableOpacity>

                <ImageUploadModal
                  header="Upload Profile Picture"
                  visible={add_image_modal_visible}
                  set_visible={set_add_image_modal_visible}
                  onSubmit={(imageInfo) => { set_image_info(imageInfo); }}
                />
              </>
            )
          }
          {
            !!image_info && (
              <TouchableOpacity style={StylesConstants.COMMON_STYLES.btnSecondaryFullWidth} onPress={() => { set_image_info(null); set_add_image_modal_visible(false); }}>
                <Text style={StylesConstants.COMMON_STYLES.btnTextWhite}>Clear Image</Text>
              </TouchableOpacity>
            )
          }
          {image_info && <Image style={{ width: 200, height: 200, marginVertical: 15 }} source={{ uri: image_info.uri }} />}
          {
            !!image_info && (
              <TouchableOpacity style={StylesConstants.COMMON_STYLES.btnSecondaryFullWidth} onPress={() => submitIcon()}>
                <Text style={StylesConstants.COMMON_STYLES.btnTextWhite}>Update</Text>
              </TouchableOpacity>
            )
          }
        </View>

        {/* Password */}
        <View style={[StylesConstants.COMMON_STYLES.infoBoxZeroPaddingMargin, { padding: 15, marginBottom: 15 }]}>
          <Text style={{padding: 15, fontSize: 24}}>
            Password
          </Text>

          <CommonTextInput
            placeholder="Enter Current Password" 
            required={true}
            label="Current Password"
            value={old_password}
            secureTextEntry={true}
            onChange={(value) => set_old_password(value)} 
          />
          <CommonTextInput
            placeholder="Enter New Password" 
            required={true}
            label="New Password"
            value={password}
            secureTextEntry={true}
            onChange={(value) => set_password(value)} 
          />
          <CommonTextInput
            placeholder="Enter Confirm New Password" 
            required={true}
            label="Confirm New Password"
            value={confirm_password}
            secureTextEntry={true}
            onChange={(value) => set_confirm_password(value)} 
          />
          
          <TouchableOpacity
            style={[StylesConstants.COMMON_STYLES.btnSecondaryFullWidth, { marginTop: 10 }]}
            onPress={submitPasswordChange}
          >
            <Text style={StylesConstants.COMMON_STYLES.btnTextWhite}>Update</Text>
          </TouchableOpacity>
        </View>


        {/* Stripe Connect */}
        <View style={[StylesConstants.COMMON_STYLES.infoBoxZeroPaddingMargin, { padding: 15, marginBottom: 15 }]}>
          <Text style={{padding: 15, fontSize: 24}}>
            Stripe Connected Account
          </Text>

          {
            !!you.stripe_account_id && !!you.stripe_account_verified && (
              <Text>You're connected!</Text>
            ) || (
              <TouchableOpacity
                style={[StylesConstants.COMMON_STYLES.btnPrimaryFullWidth, { marginTop: 10 }]}
                onPress={createStripeAccount}
              >
                <Text style={StylesConstants.COMMON_STYLES.btnTextWhite}>
                  Connect with Stripe
                </Text>
              </TouchableOpacity>
            )
          }
        </View>



        {/* Stripe Payment options */}
        <View style={[StylesConstants.COMMON_STYLES.infoBoxZeroPaddingMargin, { padding: 15, marginBottom: 15 }]}>
          <Text style={{padding: 15, fontSize: 24}}>
            Membership
          </Text>
          <View>
            {
              !!platform_subscription && (
                <View>
                  {
                    platform_subscription?.status === 'active'
                      ? (
                        <>
                          <Text>
                            You have an active membership! It will renew on {platform_subscription_end}
                          </Text>
                          <TouchableOpacity
                            style={[StylesConstants.COMMON_STYLES.btnSecondaryFullWidth, { marginVertical: 10 }]} 
                            onPress={() => onUnsubscribeToPlatform()}
                          >
                            <Text style={StylesConstants.COMMON_STYLES.btnTextWhite}>
                              Cancel Subscription
                            </Text>
                          </TouchableOpacity>
                        </>
                      ) : (
                        <Text>
                          {
                            isSubscriptionExpired ? (
                              `You have an expired membership. It ended on ${platform_subscription_end}. You will not be charged again.`
                            ) : (
                              `You have a canceled membership. It expires on ${platform_subscription_end}. You will not be charged again.`
                            )
                          }
                        </Text>
                      )
                  }
                </View>
              ) || (
                <View>
                  <Text style={{ marginVertical: 5 }}>Subscribe today for membership perks!</Text>
                  {
                    !!payment_methods.length && (
                      <>
                        <SelectInput
                          placeholder="Select Payment Method"
                          required={true} label="Payment Method"
                          items={payment_methods} value={payment_method_id}
                          onChange={(value) => set_payment_method_id(value)} 
                        />
                        <TouchableOpacity style={StylesConstants.COMMON_STYLES.btnPrimaryFullWidth} onPress={() => onSubscribeToPlatform()}>
                          <Text style={StylesConstants.COMMON_STYLES.btnTextWhite}>Subscribe</Text>
                        </TouchableOpacity>
                      </>
                    ) || (
                      <Text>Please add a payment to subscribe</Text>
                    )
                  }
                </View>
              )
            }
          </View>
        </View>


        {/* Stripe Payment Method Form */}
        <View style={[StylesConstants.COMMON_STYLES.infoBoxZeroPaddingMargin, { padding: 15, marginBottom: 15 }]}>
          <Text style={{padding: 15, fontSize: 24}}>
            Stripe Customer Account
          </Text>
          <Text style={{ marginBottom: 10 }}>Add a debit/credit card to your customer account</Text>

          {/* <CardField
            postalCodeEnabled={true}
            placeholders={{
              number: '4242 4242 4242 4242',
            }}
            cardStyle={{
              backgroundColor: '#FFFFFF',
              textColor: '#000000',
            }}
            style={{
              width: '100%',
              height: 50,
              marginVertical: 30,
            }}
            onCardChange={(cardDetails) => {
              const valid: boolean = (
                cardDetails.complete &&
                cardDetails.validCVC === 'Valid' &&
                cardDetails.validExpiryDate === 'Valid' &&
                cardDetails.validNumber === 'Valid'
              );
              valid && set_card_details(cardDetails);
            }}
          /> */}

          <CardForm
            ref={(cfr) => { cardFormRef.current = cfr }}
            cardStyle={{
              backgroundColor: '#FFFFFF',
            }}
            style={{ width: '100%', height: 300 }}
            onFormComplete={(cardFormDetails) => {
              console.log(`cardFormDetails:`, { cardFormDetails });
              setCardFormDetails(cardFormDetails);
            }}
          />

          <TouchableOpacity
            style={cardFormDetails?.complete ? StylesConstants.COMMON_STYLES.btnPrimaryFullWidth : StylesConstants.COMMON_STYLES.btnSecondaryFullWidth}
            onPress={addCardToStripeCustomerAccount}
          >
            <Text style={StylesConstants.COMMON_STYLES.btnTextWhite}>
              Add Payment Option
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stripe Payment methods */}
        <View style={[StylesConstants.COMMON_STYLES.infoBoxZeroPaddingMargin, { padding: 15, marginBottom: 15 }]}>
          <Text style={{padding: 15, fontSize: 24}}>
            Stripe Payment Methods
          </Text>

            {
              !!payment_methods.length && payment_methods.map((pm, i: number) => (
                <View key={pm.key} style={{ marginVertical: 10, padding: 10, borderColor: StylesConstants.MEDIUM_GREY, borderWidth: 0.5 }}>
                  <Text style={{ fontSize: 24, marginVertical: 15 }}>{pm.label}</Text>
                  <TouchableOpacity
                    style={StylesConstants.COMMON_STYLES.btnSecondaryFullWidth}
                    onPress={() => removePaymentMethod(pm, i)}
                  >
                    <Text style={StylesConstants.COMMON_STYLES.btnTextWhite}>
                      Remove
                    </Text>
                  </TouchableOpacity>
                </View>
              ))
            }
        </View>


      </KeyboardAwareScrollView>
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
