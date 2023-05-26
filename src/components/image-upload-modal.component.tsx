import { SafeAreaView, View, Text, TouchableOpacity, Modal, ScrollView, Image, Platform, Alert } from 'react-native';
import { StylesConstants } from '../services/styles.constants';
import { PageHeader } from '../components/page-headers/page-header.component';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  useCameraPermissions,
  useMediaLibraryPermissions,
  launchImageLibraryAsync,
  MediaTypeOptions,
  launchCameraAsync,
  PermissionStatus,
} from 'expo-image-picker';


export function ImageUploadModal(props) {
  const [libraryPermissions, requestLibraryPermissions, getLibraryPermissions] = useMediaLibraryPermissions();
  const [cameraPermissions, requestCameraPermissions, getCameraPermissions] = useCameraPermissions();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [image, set_image] = useState("");



  const verifyLibraryPermission = async () => {
    const currentPermissions = await getLibraryPermissions();
    console.log(`asking for library permission...`, cameraPermissions, currentPermissions);
    if (!currentPermissions.granted) {
      // Ask the user for the permission to access the camera
      const permissionResult = await requestLibraryPermissions();
      console.log({ permissionResult });
      if (permissionResult.granted === false) {
        Alert.alert("You've refused to allow this app to access your library");
        return false;
      }
      else {
        return true;
      }
    }

    return true;
  };

  const verifyCameraPermission = async () => {
    const currentPermissions = await getCameraPermissions();
    console.log(`asking for camera permission...`, cameraPermissions, currentPermissions);
    if (!currentPermissions.granted) {
      // Ask the user for the permission to access the camera
      const permissionResult = await requestCameraPermissions();
      console.log({ permissionResult });
      if (permissionResult.granted === false) {
        Alert.alert("You've refused to allow this app to access your library");
        return false;
      }
      else {
        return true;
      }
    }

    return true;
  };
  
  const pickImage = async () => {
    const hasPermission = await verifyLibraryPermission();
    console.log(`pickImage:`, { hasPermission });
    if (!hasPermission) {
      return;
    }

    console.log(`Launching library...`);
    
    // No permissions request is necessary for launching the image library
    let result = await launchImageLibraryAsync({
      mediaTypes: MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    
    console.log(result);
    
    if (!result.cancelled) {
      set_image(result.uri);
    }
  };
  
  const openCamera = async () => {
    const hasPermission = await verifyCameraPermission();
    console.log(`openCamera:`, { hasPermission });
    if (!hasPermission) {
      return;
    }

    console.log(`Launching camera...`);

    const result = await launchCameraAsync({
      mediaTypes: MediaTypeOptions.Images,
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
    });

    // Explore the result
    console.log(result);

    if (!result.cancelled) {
      set_image(result.uri);
    }
}

  const provideImageData = () => {
    // https://stackoverflow.com/questions/42521679/how-can-i-upload-a-photo-with-expo
    let localUri = image;
    let filename = localUri.split('/').pop()!;

    // Infer the type of the image
    let match = /\.(\w+)$/.exec(filename);
    let filetype = match ? `image/${match[1]}` : `image`;
    const uri = Platform.OS === "android" ? image : image.replace("file://", "");
    const imageInfo = {
      name: filename,
      type: filetype,
      uri,
    };

    console.log({ imageInfo });

    props.onSubmit(imageInfo);
    props.set_visible(false);
  };

  return (
    <Modal visible={props.visible} animationType="slide">
      <SafeAreaView style={StylesConstants.COMMON_STYLES.safeAreaViewContainer}>
        <PageHeader header={props.header}>
          <TouchableOpacity style={{ marginLeft: 25 }} onPress={() => { props.set_visible(false); }}>
            <Ionicons name="md-return-up-back-outline" size={24} color="black" />
          </TouchableOpacity>
        </PageHeader>

        <ScrollView style={[StylesConstants.COMMON_STYLES.bgGrey, { padding: 10 }]}>
          <View style={[StylesConstants.COMMON_STYLES.infoBoxZeroPaddingMargin, { padding: 15 }]}>
            {
              !image && (
                <TouchableOpacity style={[StylesConstants.COMMON_STYLES.btnSecondaryFullWidth, { margin: 5 }]} onPress={pickImage}>
                  <Text style={StylesConstants.COMMON_STYLES.btnTextWhite}>Choose from library</Text>
                </TouchableOpacity>
              )
            }
            {
              !image && (
                <TouchableOpacity style={[StylesConstants.COMMON_STYLES.btnSecondaryFullWidth, { margin: 5 }]} onPress={openCamera}>
                  <Text style={StylesConstants.COMMON_STYLES.btnTextWhite}>Use Camera</Text>
                </TouchableOpacity>
              )
            }

            {
              !!image && (
                <TouchableOpacity style={[StylesConstants.COMMON_STYLES.btnSecondaryFullWidth, { margin: 5 }]} onPress={() => set_image("")}>
                  <Text style={StylesConstants.COMMON_STYLES.btnTextWhite}>Clear Image</Text>
                </TouchableOpacity>
              )
            }
            {image && <Image style={{ width: 200, height: 200, marginTop: 15 }} source={{ uri: image }} />}

            {
              !!image && (
                <TouchableOpacity style={[StylesConstants.COMMON_STYLES.btnSecondaryFullWidth, { marginTop: 10 }]} onPress={provideImageData}>
                  <Text style={StylesConstants.COMMON_STYLES.btnTextWhite}>
                    Submit
                  </Text>
                </TouchableOpacity>
              )
            }
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}