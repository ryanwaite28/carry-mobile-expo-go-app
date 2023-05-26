import { Modal, SafeAreaView, View, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { StylesConstants } from "../services/styles.constants";
import { PageHeader } from '../components/page-headers/page-header.component';
import React from 'react';


export function CommonModal(props) {
  return (
    <Modal 
      animationType="slide"
      visible={props.modal_visible}
    >
      <SafeAreaView style={StylesConstants.COMMON_STYLES.safeAreaViewContainer}>
        <PageHeader header={props.header}>
          <TouchableOpacity style={{ marginLeft: 25 }} onPress={() => { props.set_modal_visible(false); }}>
            <Ionicons name="md-return-up-back-outline" size={24} color="black" />
          </TouchableOpacity>
        </PageHeader>

        {
          !!props.handleMainSection
            ? (
                props.children
              )
            : (
                <ScrollView style={[{ padding: 15, marginBottom: 0 }, StylesConstants.COMMON_STYLES.bgGrey]}>
                  {
                    props.children
                  }
                </ScrollView>
              )
        }
        
        

      </SafeAreaView>
    </Modal>
  );
}