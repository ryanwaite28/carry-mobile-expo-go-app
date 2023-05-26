import React from 'react';
import { View } from "react-native";
import { StylesConstants } from "../services/styles.constants";


export const renderFlatlistSeparator = () => {
  return (
    <View
      style={{
        height: 0.5,
        width: '100%',
        backgroundColor: StylesConstants.MEDIUM_GREY
      }}
    />
  );
};



const Column = ({children,style})=>{
  return <View
     style={[{display: 'flex', flexDirection: 'column'},style]}>
     {children}
   </View>
}

const Row = ({children,style})=>{
  return <View
     style={[{display: 'flex', flexDirection: 'row'},style]}>
     {children}
   </View>
}

export const UnorderedList = (texts: string[]) => {
  return (
    <Column>
      {texts.map((t, index) => (
        <Row key={index}>
          <Column
            style={{
              alignSelf: 'flex-start',
              justifyContent: 'flex-start',
              marginRight: 12,
              transform: [{scale: 2.5}],
            }}>
            <Text
              style={{
                alignSelf: 'flex-start',
                justifyContent: 'flex-start',
              }}>
              {'\u2022'}
            </Text>
          </Column>
          <Column>
            <Text>{t}</Text>
          </Column>
        </Row>
      ))}
    </Column>
  );
};