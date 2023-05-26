import { useNavigation } from '@react-navigation/native';
import { View, TouchableOpacity } from 'react-native';
import { PageHeader } from './page-header.component';
import { Ionicons } from '@expo/vector-icons';



export function PageHeaderBack(props) {
  const navigation = useNavigation<any>();
  
  const goBackHandler = () => {
    navigation.goBack();
  };

  return (
    <PageHeader header={props.header}>

      <>
        {/* { !!props.children && <View style={{ marginRight: 25 }}>{props.children}</View> } */}
        { !!props.children && props.children}
        <TouchableOpacity onPress={goBackHandler}>
          <Ionicons name="md-return-up-back-outline" size={24} color="black" />
        </TouchableOpacity>
      </>
    </PageHeader>
  );
}