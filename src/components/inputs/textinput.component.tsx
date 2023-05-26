import { View, StyleSheet, Text, TextInput } from "react-native";
import { StylesConstants } from "../../services/styles.constants";
import { validateNumber } from "../../utils/common.utils";





export function CommonTextInput(props) {
  const convertNumber = (val: string) => {
    if (validateNumber(val)) {
      props.onChange(parseFloat(val));
    }
  };

  return (
    <View style={styles.inputContainer}>
      { props.label && <Text style={styles.label}>{(props.required ? '* ' : '') + props.label}</Text> }
      <TextInput
        placeholder={props.placeholder || ""}
        placeholderTextColor={StylesConstants.MEDIUM_GREY}
        style={[styles.input, (!props.style ? {} : Array.isArray(props.style) ? [...props.style] : props.style)]}
        onChangeText={text => props.onChange(text)}
        value={props.value}
        secureTextEntry={props.secureTextEntry || false}
        keyboardType={props.keyboardType}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flex: 1,
    marginTop: 15,
    marginBottom: 15,
  },
  input: {
    height: 40,
    backgroundColor: `white`,
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    width: `100%`,
    elevation: 3,
  },
  label: {
    marginBottom: 10,
  }
});