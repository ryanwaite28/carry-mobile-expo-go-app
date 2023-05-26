import { SafeAreaView, Text, TextInput, Alert, Button, TouchableOpacity, StyleSheet } from "react-native";
import React, { useState } from 'react';
import { StylesConstants } from "../../services/styles.constants";
import { UsersService } from "../../services/users.service";
import { LoadingScreenComponent } from '../../components/loading-screen.component';
import { CommonTextInput } from "../../components/inputs/textinput.component";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { finalize } from "rxjs";


export function LoginScreen () {
  // console.log(props);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [email_or_username, onChangeEmailOrUsername] = useState('');
  const [password, onChangePassword] = useState('');

  const signIn = () => {
    if (!email_or_username) {
      Alert.alert(`Email/Username is required.`);
      return;
    }
    if (!password) {
      Alert.alert(`Password is required.`);
      return;
    }

    const data = { email_or_username, password };
    setIsLoading(true);
    UsersService.sign_in(data)
    .pipe(finalize(() => { setIsLoading(false) }))
    .subscribe({
      next: (response) => {
        console.log(`next called`, response);
        // response.message && Alert.alert(response.message);
      },
      error: (error) => {
        console.log({ error });
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
          onChange={(value) => onChangeEmailOrUsername(value.toLowerCase())} 
          value={email_or_username} 
          required={true}
          label="Email or Username"
          placeholder="Enter Email or Username"
        />
        <CommonTextInput
          onChange={onChangePassword}
          value={password}
          required={true}
          secureTextEntry={true}
          label='Password'
          placeholder='Enter Password'
        />

        <TouchableOpacity style={StylesConstants.COMMON_STYLES.btnPrimaryFullWidth} onPress={signIn}>
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
    padding: 15,
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
