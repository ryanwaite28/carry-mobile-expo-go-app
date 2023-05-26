import { useState } from "react";
import { View, StyleSheet, Text, TextInput } from "react-native";
import { common_ios_shadow, StylesConstants } from "../../services/styles.constants";



const MIN_HEIGHT = 50;

export function TextAreaInput(props) {
  const [height, set_height] = useState(props.height ?? MIN_HEIGHT);
  
  return (
    <View style={styles.inputContainer}>
      { props.label && <Text style={styles.label}>{(props.required ? '* ' : '') + props.label}</Text> }
      <TextInput
        style={[styles.input, (!props.style ? {} : Array.isArray(props.style) ? [...props.style] : props.style), { height: Math.max(MIN_HEIGHT, height) }]}
        multiline={true}
        editable={true}
        placeholder={props.placeholder || ""}
        placeholderTextColor={StylesConstants.MEDIUM_GREY}
        numberOfLines={props.numberOfLines || 2}
        onChangeText={text => props.onChange(text)}
        value={props.value}
        onContentSizeChange={(event) => {
          set_height(event.nativeEvent.contentSize.height);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flex: 1,
    marginTop: 10,
    marginBottom: 10,
    // width: `100%`,
  },
  input: {
    backgroundColor: `white`,
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    width: `100%`,
    elevation: 2,

    ...common_ios_shadow,
  },
  label: {
    marginBottom: 10,
  }
});