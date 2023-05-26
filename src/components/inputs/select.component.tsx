import { View, StyleSheet, Text, TextInput } from "react-native";
import { validateNumber } from "../../utils/common.utils";
import React from 'react';

import { Picker } from '@react-native-picker/picker';





const defaultPlaceholder = {
  label: 'Select a sport...',
  value: null,
  color: '#9EA0A4',
};

export function SelectInput(props) {
  const placeholder = { ...defaultPlaceholder };
  if (props.placeholder) {
    placeholder.label = props.placeholder;
  }

  return (
    <View style={styles.inputContainer}>
      { props.label && <Text style={styles.label}>{(props.required ? '* ' : '') + props.label}</Text> }
      {/* <RNPickerSelect
        disabled={props.disabled || false}
        style={pickerSelectStyles}
        value={props.value}
        placeholder={placeholder}
        onValueChange={(value) => props.onChange(value)} 
        items={props.items}
        useNativeAndroidPickerStyle={props.useNativeAndroidPickerStyle || false}
      /> */}

      <Picker
        selectedValue={props.value}
        onValueChange={(value) => props.onChange(value)} 
      >
        {
          [{ label: `None Selected`, key: `_none_`, value: null }, ...props.items].map(i => <Picker.Item label={i.label} value={i.value} key={i.value} />)
        }
        
      </Picker>
    </View>
  );
}

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    backgroundColor: `white`,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  inputAndroid: {
    fontSize: 16,
    backgroundColor: `white`,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: 'purple',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
});

const styles = StyleSheet.create({
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
  },
  label: {
    marginBottom: 10,
  }
});