import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View } from 'react-native';
import { LoginScreen } from './login.screen';
import { SignupScreen } from './signup.screen';
import { WelcomeScreen } from './welcome.screen';
import React from 'react';


const Stack = createNativeStackNavigator();



export const LoggedOutStack = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen name="Welcome" component={WelcomeScreen} options={screenOptions.welcome} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
    );
};

const screenOptions = {
  welcome: {
    headerShown: false
  }
};