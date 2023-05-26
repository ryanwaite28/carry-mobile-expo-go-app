import { Text, View, Image, Button, TouchableOpacity } from "react-native";
import { StyleSheet } from 'react-native';
import { StylesConstants } from "../../services/styles.constants";
import React from 'react';



export function WelcomeScreen (props) {
    return (
        <View style={styles.container}>

                <Image style={styles.app_icon} source={require(`../../../assets/app_icon_full.png`)} />
                <View style={styles.btnContainer}>
                    <TouchableOpacity style={StylesConstants.COMMON_STYLES.btnPrimary} onPress={() => { props.navigation.navigate(`Signup`); }}>
                      <Text style={StylesConstants.COMMON_STYLES.btnTextWhite}>Sign Up</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={StylesConstants.COMMON_STYLES.btnSecondary} onPress={() => { props.navigation.navigate(`Login`); }}>
                      <Text style={StylesConstants.COMMON_STYLES.btnTextWhite}>Log In</Text>
                    </TouchableOpacity>
                </View>

        </View>
    );
}



const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingTop: `50%`,
      width: `100%`
    },
    app_icon: {
      padding: 10,
      width: 150,
      height: 150,
      resizeMode: 'contain',
      marginBottom: 100
    },
    btnContainer: {
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 100
    },
});