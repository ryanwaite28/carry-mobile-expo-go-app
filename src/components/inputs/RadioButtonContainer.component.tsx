import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import { RadioButton } from "./RadioButton.component";

export default function RadioButtonContainer({ values, onPress }) {
  const [currentSelectedItem, setCurrentSelectedItem] = useState(-1);

  const _onPress = (idx) => {
    onPress(idx);
    setCurrentSelectedItem(idx);
  };

  const _renderRadioButtons = () => {
    return (values || []).map((listItem, idx) => {
      let isChecked = currentSelectedItem === idx ? true : false;
      return (
        <RadioButton
          key={idx}
          onRadioButtonPress={() => _onPress(idx)}
          isChecked={isChecked}
          text={listItem.label}
        />
      );
    });
  };
  return <View>{_renderRadioButtons()}</View>;
}