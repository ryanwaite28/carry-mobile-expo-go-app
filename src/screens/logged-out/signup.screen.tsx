import { SafeAreaView, Text, View, Alert, Switch, TouchableOpacity, StyleSheet } from "react-native";
import React, { useState } from 'react';
import { Ionicons } from "@expo/vector-icons";

import { StylesConstants } from "../../services/styles.constants";
import { UsersService } from "../../services/users.service";
import { CommonTextInput } from '../../components/inputs/textinput.component';
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { LoadingScreenComponent } from '../../components/loading-screen.component';
import { CommonModal } from "../../components/modal.component";
import { TermsAgreementComponent } from "../../components/terms-agreement.component";
import { finalize } from "rxjs";


export function SignupScreen () {
  // console.log(props);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [acknowledged, set_acknowledged] = useState(false);
  const [terms_modal_visible, set_terms_modal_visible] = useState(false);

  const [firstname, set_firstname] = useState('');
  const [middlename, set_middlename] = useState('');
  const [lastname, set_lastname] = useState('');
  const [email, set_email] = useState('');

  const [password, set_password] = useState('');
  const [confirm_password, set_confirm_password] = useState('');

  const signUp = () => {
    if (!acknowledged) {
      Alert.alert(`Please acknowledge and accept terms and agreements.`);
      return;
    }

    const data = {
      firstname,
      middlename,
      lastname,
      email,
      password,
      confirmPassword: confirm_password
    };
    setIsLoading(true);
    UsersService.sign_up(data)
    .pipe(finalize(() => { setIsLoading(false) }))
    .subscribe({
      next: (response) => {
        console.log(`next called`, response);
        response.message && Alert.alert(response.message);
      },
      error: (error) => {
        error.response?.data?.message && Alert.alert(error.response?.data?.message);
      }
    });
  };



  if (isLoading) {
    return (
      <LoadingScreenComponent />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView style={{ padding: 15, marginBottom: 25 }}>
        <CommonTextInput
          placeholder="Enter First Name" 
          required={true}
          label="First Name"
          value={firstname}
          onChange={(value) => set_firstname(value)} 
        />
        <CommonTextInput
          placeholder="Enter Middle Name" 
          required={false}
          label="Middle Name"
          value={middlename}
          onChange={(value) => set_middlename(value)} 
        />
        <CommonTextInput
          placeholder="Enter Last Name" 
          required={true}
          label="Last Name"
          value={lastname}
          onChange={(value) => set_lastname(value)} 
        />
        <CommonTextInput
          placeholder="Enter Email" 
          keyboardType="email-address"
          required={true}
          label="Email"
          value={email}
          onChange={(value) => set_email(value.toLowerCase())} 
        />

        <CommonTextInput
          placeholder="Enter Password" 
          required={true}
          label="Password"
          value={password}
          secureTextEntry={true}
          onChange={(value) => set_password(value)} 
        />
        <CommonTextInput
          placeholder="Enter Confirm Password" 
          required={true}
          label="Confirm Password"
          value={confirm_password}
          secureTextEntry={true}
          onChange={(value) => set_confirm_password(value)} 
        />

        <View style={{ display: 'flex', flexDirection: 'row', marginTop: 15, marginBottom: 15, alignItems: 'center' }}>
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

        <TouchableOpacity style={[StylesConstants.COMMON_STYLES.btnPrimaryFullWidth, { marginVertical: 25 }]} onPress={signUp}>
          <Text style={StylesConstants.COMMON_STYLES.btnTextWhite}>Submit</Text>
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}




const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15
  },

  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    width: `90%`,
    elevation: 3,
  },
});
