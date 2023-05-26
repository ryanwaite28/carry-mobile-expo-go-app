import { SafeAreaView, StyleSheet, Text, TouchableOpacity, Modal, ScrollView, Image, Platform } from 'react-native';
import { StylesConstants } from '../services/styles.constants';
import { PageHeader } from '../components/page-headers/page-header.component';
import { useState, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Buffer } from "buffer";
import SignatureScreen, { SignatureViewRef } from "react-native-signature-canvas";


export function SignatureCaptureModal(props) {
  const signatureRef = useRef<SignatureViewRef>(null);

  const provideImageData = async (base64_signature) => {
    console.log(`provideImageData:`, Platform.OS);
    const file_name = `${Date.now()}-signature.png`;
    const file_type = `image/png`;

    if (Platform.OS === `android`) {
      const imageInfo = {
        name: file_name,
        type: file_type,
        uri: base64_signature,
      };
  
      console.log(`sig captured 2`, imageInfo);
      signatureRef.current!.clearSignature();
      
      props.onSubmit(base64_signature);
    }

    else {
      const imageInfo = {
        name: file_name,
        type: file_type,
        uri: base64_signature,
      };
      console.log(`sig captured 2`, imageInfo);
      signatureRef.current!.clearSignature();
      props.onSubmit(imageInfo);
    }

  };
  
  // Called after ref.current.readSignature() reads a non-empty base64 string
  const handleOK = (signature) => {
    console.log(`sig captured`);
    provideImageData(signature); // Callback from Component props
  };

  // Called after ref.current.readSignature() reads an empty string
  const handleEmpty = () => {
    console.log("Empty");
  };

  // Called after ref.current.clearSignature()
  const handleClear = () => {
    console.log("clear success!", Date.now());
    // signatureRef.current!.clearSignature();
  };

  // Called after end of stroke
  const handleEnd = () => {
    signatureRef.current?.readSignature();
  };

  // Called after ref.current.getData()
  const handleData = (data) => {
    console.log(`data`, );
    // signatureRef.current!.readSignature();
  };

  return (
    <Modal visible={props.visible} animationType="slide">
      <SafeAreaView style={[StylesConstants.COMMON_STYLES.safeAreaViewContainer, { flex: 1 }]}>
        <PageHeader header={props.header}>
          <TouchableOpacity style={{ marginLeft: 25 }} onPress={() => { props.set_visible(false); }}>
            <Ionicons name="md-return-up-back-outline" size={24} color="black" />
          </TouchableOpacity>
        </PageHeader>

        {/* <Text>Sign</Text> */}

        <SignatureScreen
          style={styles.signatureContainer}
          autoClear={false}
          ref={signatureRef}
          // onEnd={handleEnd}
          onOK={handleOK}
          onEmpty={handleEmpty}
          onClear={handleClear}
          onGetData={handleData}
          descriptionText={"Signature"}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  signatureContainer: {
    // padding: 15
  },
  signature: {
      flex: 1,
      borderColor: '#000033',
      borderWidth: 1,
  },
  buttonStyle: {
      flex: 1, justifyContent: "center", alignItems: "center", height: 50,
      backgroundColor: "#eeeeee",
      margin: 10
  }
});