import { View, ActivityIndicator, StyleSheet } from "react-native";



export function LoadingScreenComponent() {
  return (
    <View style={styles.container}>
      <ActivityIndicator animating={true} />
    </View>
  ); 
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
