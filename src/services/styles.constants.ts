import { Dimensions, Platform, StatusBar, StyleSheet } from 'react-native';
import { DeliveryDisputeStatus } from '../enums/modern.enums';








export const common_ios_shadow = StyleSheet.create({
  ios: {
    shadowColor: `black`,
    shadowOffset: { width: 0, height: 1.5 },
    shadowRadius: 5,
    shadowOpacity: 0.25,
  }
});

export class StylesConstants {
  static readonly APP_PRIMARY_COLOR: string = '#8861ff';
  static readonly APP_SECONDARY_COLOR: string = '#d76dfe';
  static readonly MEDIUM_GREY: string = '#868686';
  static readonly MEDIUM_LIGHT_GREY: string = '#D0D0D0';
  static readonly MEDIUM_LIGHTER_GREY: string = '#E8E8E8';
  static readonly LIGHT_GREY: string = '#f2f2f2';
  static readonly WHITE: string = 'white';
  static readonly BLACK: string = 'black';

  static readonly TABNAV_HEIGHT: number = 50;



  private static readonly GENERIC_STYLES = {
    navText: {
      fontSize: 20,
    },
    flexCenter: {
      flex: 1, 
      alignItems: 'center', 
      justifyContent: `center` 
    },
    flexRow: {
      flex: 1, 
      flexDirection: `row`,
    },
    flexRowSpaceBetween: {
      flex: 1, 
      flexDirection: `row`, 
      alignItems: 'flex-start', 
      justifyContent: `space-between` 
    },
    flexRowSpaceBetweenCenter: {
      flex: 1, 
      flexDirection: `row`, 
      alignItems: 'center', 
      justifyContent: `space-between` 
    },
    textWrap: { marginBottom: 10, flexShrink: 1, flexWrap: 'wrap' },
    userIcon: {
      width: 75,
      height: 75,
      borderRadius: 75,
    },
    userIconSm: {
      width: 50,
      height: 50,
      borderRadius: 50,
    },

    btn: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 32,
      borderRadius: 4,
      elevation: 3,
      width: 250,

      ...common_ios_shadow,
    },
    btnFullWidth: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 32,
      borderRadius: 4,
      elevation: 3,
      width: `100%`,

      ...common_ios_shadow,
    },
    
    btnPrimary: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 32,
      borderRadius: 4,
      elevation: 3,
      backgroundColor: StylesConstants.APP_PRIMARY_COLOR,
      width: 250,

      ...common_ios_shadow,
    },
    btnPrimaryFullWidth: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 32,
      borderRadius: 4,
      elevation: 3,
      backgroundColor: StylesConstants.APP_PRIMARY_COLOR,
      width: `100%`,

      ...common_ios_shadow,
    },
    btnSecondary: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 32,
      borderRadius: 4,
      elevation: 3,
      backgroundColor: StylesConstants.MEDIUM_GREY,
      width: 250,

      ...common_ios_shadow,
    },
    btnSecondaryFullWidth: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 32,
      borderRadius: 4,
      elevation: 3,
      backgroundColor: StylesConstants.MEDIUM_GREY,
      width: `100%`,

      ...common_ios_shadow,
    },
    btnInfo: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 32,
      borderRadius: 4,
      elevation: 3,
      backgroundColor: `blue`,
      width: 250,

      ...common_ios_shadow,
    },
    btnInfoFullWidth: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 32,
      borderRadius: 4,
      elevation: 3,
      backgroundColor: `blue`,
      width: `100%`,

      ...common_ios_shadow,
    },
    btnSuccess: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 32,
      borderRadius: 4,
      elevation: 3,
      backgroundColor: `green`,
      width: 250,

      ...common_ios_shadow,
    },
    btnSuccessFullWidth: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 32,
      borderRadius: 4,
      elevation: 3,
      backgroundColor: `green`,
      width: `100%`,

      ...common_ios_shadow,
    },
    btnWarning: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 32,
      borderRadius: 4,
      elevation: 3,
      backgroundColor: `yellow`,
      width: 250,

      ...common_ios_shadow,
    },
    btnWarningFullWidth: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 32,
      borderRadius: 4,
      elevation: 3,
      backgroundColor: `yellow`,
      width: `100%`,

      ...common_ios_shadow,
    },
    btnDanger: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 32,
      borderRadius: 4,
      elevation: 3,
      backgroundColor: `red`,
      width: 250,

      ...common_ios_shadow,
    },
    btnDangerFullWidth: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 32,
      borderRadius: 4,
      elevation: 3,
      backgroundColor: `red`,
      width: `100%`,

      ...common_ios_shadow,
    },
    btnTextWhite: {
      fontSize: 16,
      lineHeight: 21,
      fontWeight: 'bold',
      letterSpacing: 0.25,
      color: 'white',
    },
    btnTextBlack: {
      fontSize: 16,
      lineHeight: 21,
      fontWeight: 'bold',
      letterSpacing: 0.25,
      color: 'black',
    },
  
    inputContainer: {
      flex: 1,
      marginTop: 15,
      marginBottom: 15,
    },
    input: {
      height: 40,
      // margin: 12,
      borderWidth: 1,
      borderRadius: 4,
      padding: 10,
      width: `100%`,
      elevation: 3,

      ...common_ios_shadow,
    },
    label: {
      marginBottom: 10,
    },
  
    infoBox: {
      elevation: 5,
      borderRadius: 2,
      borderColor: StylesConstants.MEDIUM_LIGHT_GREY,
      borderWidth: 1,
      padding: 15,
      marginBottom: 15,
      overflow: `hidden`,
  
      backgroundColor: 'white',
      
      ...common_ios_shadow,
    },
  
    infoBoxZeroPaddingMargin: {
      elevation: 5,
      borderRadius: 2,
      borderColor: StylesConstants.MEDIUM_LIGHT_GREY,
      borderWidth: 1,
      overflow: `hidden`,
  
      backgroundColor: 'white',
      ...common_ios_shadow,
    },

    listItem: {
      elevation: 5,
      borderLeftColor: StylesConstants.MEDIUM_LIGHT_GREY,
      borderRightColor: StylesConstants.MEDIUM_LIGHT_GREY,
      borderTopColor: StylesConstants.MEDIUM_LIGHT_GREY,
      borderLeftWidth: 1,
      borderRightWidth: 1,
      borderTopWidth: 1,
      overflow: `hidden`,
  
      backgroundColor: 'white',
      shadowColor: 'black',
      shadowOpacity: 0.10,
      shadowRadius: 7,
      shadowOffset: { width: 1, height: 1 },
    },
    listItemEnd: {
      elevation: 5,
      borderColor: StylesConstants.MEDIUM_LIGHT_GREY,
      borderWidth: 1,
      overflow: `hidden`,
  
      backgroundColor: 'white',
      shadowColor: 'black',
      shadowOpacity: 0.10,
      shadowRadius: 7,
      shadowOffset: { width: 1, height: 1 },
    },

    borderH: {
      borderLeftColor: StylesConstants.MEDIUM_LIGHT_GREY,
      borderRightColor: StylesConstants.MEDIUM_LIGHT_GREY,
      borderLeftWidth: 1,
      borderRightWidth: 1,
    },
    borderV: {
      borderTopColor: StylesConstants.MEDIUM_LIGHT_GREY,
      borderBottomColor: StylesConstants.MEDIUM_LIGHT_GREY,
      borderTopWidth: 1,
      borderBottomWidth: 1,
    },
    borderL: {
      borderLeftColor: StylesConstants.MEDIUM_LIGHT_GREY,
      borderLeftWidth: 1,
    },
    borderT: {
      borderTopColor: StylesConstants.MEDIUM_LIGHT_GREY,
      borderTopWidth: 1,
    },
    borderR: {
      borderRightColor: StylesConstants.MEDIUM_LIGHT_GREY,
      borderRightWidth: 1,
    },
    borderB: {
      borderBottomColor: StylesConstants.MEDIUM_LIGHT_GREY,
      borderBottomWidth: 1,
    },
  };

  private static readonly COMMON_IOS_STYLES = StyleSheet.create(<any> {
    ...StylesConstants.GENERIC_STYLES,
    safeAreaViewContainer: {
      flex: 1,
      // paddingTop: StatusBar.currentHeight,
      backgroundColor: StylesConstants.WHITE,
      // backgroundColor: StylesConstants.LIGHT_GREY,
      // paddingBottom: StylesConstants.TABNAV_HEIGHT + 50,
      
      // width: Dimensions.get('window').width,
      // height: Dimensions.get('window').height,
      // width: Dimensions.get('screen').width,
      // height: Dimensions.get('screen').height,
    },
    navContainer: {
      paddingTop: (StatusBar.currentHeight || 0) + 20,
      paddingHorizontal: 20,
      paddingBottom: 20,
      backgroundColor: StylesConstants.WHITE,
      borderBottomColor: StylesConstants.MEDIUM_GREY,
      borderBottomWidth: 0.5,
      width: `100%`,
    },
    navBar: {
      flexGrow: 1, 
      flexDirection: `row`, 
      alignItems: 'center', 
      justifyContent: `space-between`,
    },
  });

  private static readonly COMMON_ANDROID_STYLES = StyleSheet.create(<any> {
    ...StylesConstants.GENERIC_STYLES,
    safeAreaViewContainer: {
      // flex: 1,
      flexGrow: 1,
      // paddingTop: StatusBar.currentHeight,
      // backgroundColor: StylesConstants.WHITE,
      backgroundColor: StylesConstants.LIGHT_GREY,
      paddingBottom: StylesConstants.TABNAV_HEIGHT + 45,
      
      // width: Dimensions.get('window').width,
      // height: Dimensions.get('window').height,
      // width: Dimensions.get('screen').width,
      // height: Dimensions.get('screen').height,
    },
    navContainer: {
      paddingTop: (StatusBar.currentHeight || 0) + 20,
      paddingHorizontal: 20,
      paddingBottom: 20,
      backgroundColor: StylesConstants.WHITE,
      borderBottomColor: StylesConstants.MEDIUM_GREY,
      borderBottomWidth: 0.5,
      width: `100%`,
    },
    navBar: {
      flexGrow: 1, 
      flexDirection: `row`, 
      alignItems: 'center', 
      justifyContent: `space-between`,
    },
  });

  private static readonly UseStyles = Platform.OS === `android`
    ? StylesConstants.COMMON_ANDROID_STYLES
    : StylesConstants.COMMON_IOS_STYLES;

  static readonly COMMON_STYLES = StyleSheet.create(StylesConstants.UseStyles);

  // static readonly COMMON_STYLES = StyleSheet.create({
  //   bgGrey: {
  //     backgroundColor: StylesConstants.LIGHT_GREY,
  //   },
  //   container: {
  //     flex: 1,
  //     paddingTop: StatusBar.currentHeight,
  //     backgroundColor: StylesConstants.WHITE,
  //   },
  //   safeAreaViewContainer: {
  //     // flex: 1,
  //     // paddingTop: StatusBar.currentHeight,
  //     // backgroundColor: StylesConstants.WHITE,
  //     backgroundColor: StylesConstants.LIGHT_GREY,
  //     paddingBottom: StylesConstants.TABNAV_HEIGHT + 25,
      
  //     // width: Dimensions.get('window').width,
  //     // height: Dimensions.get('window').height,
  //     // width: Dimensions.get('screen').width,
  //     // height: Dimensions.get('screen').height,
  //   },
  //   navContainer: {
  //     paddingTop: (StatusBar.currentHeight || 0) + 20,
  //     paddingHorizontal: 20,
  //     paddingBottom: 20,
  //     backgroundColor: StylesConstants.WHITE,
  //     borderBottomColor: StylesConstants.MEDIUM_GREY,
  //     borderBottomWidth: 0.5,
  //     width: `100%`,
  //   },
  //   full: {
  //     // flexGrow: 1,
  //     // alignItems: 'center',
  //     // justifyContent: 'center',
  //     // alignSelf: `stretch`,
  //     // width: `100%`,
  //     // height: Dimensions.get('window').height,
  //   },
  //   navText: {
  //     fontSize: 20,
  //   },
  //   navBar: {
  //     flexGrow: 1, 
  //     flexDirection: `row`, 
  //     alignItems: 'center', 
  //     justifyContent: `space-between`,
  //   },
  //   flexCenter: {
  //     flex: 1, 
  //     alignItems: 'center', 
  //     justifyContent: `center` 
  //   },
  //   flexRow: {
  //     flex: 1, 
  //     flexDirection: `row`,
  //   },
  //   flexRowSpaceBetween: {
  //     flex: 1, 
  //     flexDirection: `row`, 
  //     alignItems: 'flex-start', 
  //     justifyContent: `space-between` 
  //   },
  //   flexRowSpaceBetweenCenter: {
  //     flex: 1, 
  //     flexDirection: `row`, 
  //     alignItems: 'center', 
  //     justifyContent: `space-between` 
  //   },
  //   textWrap: { marginBottom: 10, flexShrink: 1, flexWrap: 'wrap' },
  //   userIcon: {
  //     width: 75,
  //     height: 75,
  //     borderRadius: 75,
  //   },
    
  //   btnPrimary: {
  //     alignItems: 'center',
  //     justifyContent: 'center',
  //     paddingVertical: 12,
  //     paddingHorizontal: 32,
  //     borderRadius: 4,
  //     elevation: 3,
  //     backgroundColor: StylesConstants.APP_PRIMARY_COLOR,
  //     width: 250,
  //   },
  //   btnPrimaryFullWidth: {
  //     alignItems: 'center',
  //     justifyContent: 'center',
  //     paddingVertical: 12,
  //     paddingHorizontal: 32,
  //     borderRadius: 4,
  //     elevation: 3,
  //     backgroundColor: StylesConstants.APP_PRIMARY_COLOR,
  //     width: `100%`,
  //   },
  //   btnSecondary: {
  //     alignItems: 'center',
  //     justifyContent: 'center',
  //     paddingVertical: 12,
  //     paddingHorizontal: 32,
  //     borderRadius: 4,
  //     elevation: 3,
  //     backgroundColor: StylesConstants.MEDIUM_GREY,
  //     width: 250,
  //   },
  //   btnSecondaryFullWidth: {
  //     alignItems: 'center',
  //     justifyContent: 'center',
  //     paddingVertical: 12,
  //     paddingHorizontal: 32,
  //     borderRadius: 4,
  //     elevation: 3,
  //     backgroundColor: StylesConstants.MEDIUM_GREY,
  //     width: `100%`,
  //   },
  //   btnTextWhite: {
  //     fontSize: 16,
  //     lineHeight: 21,
  //     fontWeight: 'bold',
  //     letterSpacing: 0.25,
  //     color: 'white',
  //   },

  //   inputContainer: {
  //     flex: 1,
  //     marginTop: 15,
  //     marginBottom: 15,
  //   },
  //   input: {
  //     height: 40,
  //     // margin: 12,
  //     borderWidth: 1,
  //     borderRadius: 4,
  //     padding: 10,
  //     width: `100%`,
  //     elevation: 3,
  //   },
  //   label: {
  //     marginBottom: 10,
  //   },

  //   infoBox: {
  //     elevation: 5,
  //     borderRadius: 2,
  //     borderColor: StylesConstants.MEDIUM_LIGHT_GREY,
  //     borderWidth: 1,
  //     padding: 25,
  //     marginBottom: 25,
  
  //     backgroundColor: 'white',
  //     shadowColor: 'black',
  //     shadowOpacity: 0.10,
  //     shadowRadius: 7,
  //     shadowOffset: { width: 0, height: 1 },
  //   },

  //   infoBoxZeroPaddingMargin: {
  //     elevation: 5,
  //     borderRadius: 2,
  //     borderColor: StylesConstants.MEDIUM_LIGHT_GREY,
  //     borderWidth: 1,
  
  //     backgroundColor: 'white',
  //     shadowColor: 'black',
  //     shadowOpacity: 0.10,
  //     shadowRadius: 7,
  //     shadowOffset: { width: 0, height: 1 },
  //   },
  // });

  
}



export const disputeTextStyles = StyleSheet.create({
  [DeliveryDisputeStatus.OPEN]: {
    padding: 4,
    color: `white`,
    backgroundColor: `red`,
    borderColor: `red`,
    borderWidth: 0.5,
    borderRadius: 4,
    // overflow: 'hidden',
  },
  [DeliveryDisputeStatus.RESOLVED]: {
    padding: 4,
    color: `white`,
    backgroundColor: `blue`,
    borderColor: `blue`,
    borderWidth: 0.5,
    borderRadius: 4,
    // overflow: 'hidden',
  },
  [DeliveryDisputeStatus.CLOSED]: {
    padding: 4,
    color: `white`,
    backgroundColor: StylesConstants.MEDIUM_LIGHT_GREY,
    borderColor: StylesConstants.MEDIUM_LIGHT_GREY,
    borderWidth: 0.5,
    borderRadius: 4,
    // overflow: 'hidden',
  },
});